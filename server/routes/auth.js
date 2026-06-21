const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const multer     = require("multer");
const path       = require("path");
const fs         = require("fs");
const { v4: uuidv4 } = require("uuid");
const store      = require("../utils/store");
const passport   = require("../utils/passport");
const { applyLoginStreak } = require("../utils/streak");
const auth       = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "studymate_secret_2024";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function mintToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
}
function safeUser(u) { const { password, ...safe } = u; return safe; }

// ── Register ──
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (store.users.find(u => u.email === email)) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(), name, email, password: hashed,
      avatar: name.charAt(0).toUpperCase(),
      avatar_url: null,
      oauth: {},
      streak: 0, xp: 0, level: 1,
      last_login_date: null,
      created_at: new Date().toISOString(),
    };
    applyLoginStreak(user); // sets streak = 1 on first ever login

    store.users.push(user);
    await store.saveUser(user);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("[auth/register]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Login ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: "No account found with that email" });
    if (!user.password) return res.status(400).json({ error: "This account uses social login — sign in with Google, GitHub, or Discord." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    applyLoginStreak(user);
    await store.saveUser(user);

    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Me (get current user) ──
router.get("/me", auth, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(safeUser(user));
});

// ── Update profile (name, etc.) ──
router.put("/me", auth, async (req, res) => {
  try {
    const user = store.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name } = req.body;
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ error: "Name cannot be empty" });
      if (trimmed.length > 60) return res.status(400).json({ error: "Name is too long (max 60 characters)" });
      user.name = trimmed;
      if (!user.avatar_url) user.avatar = trimmed.charAt(0).toUpperCase();
    }

    await store.saveUser(user);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("[auth/me PUT]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Avatar upload ──
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP, or GIF images are allowed"));
  },
});

router.post("/me/avatar", auth, avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const user = store.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.avatar_url && user.avatar_url.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", user.avatar_url);
      if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (e) {} }
    }

    user.avatar_url = `/uploads/avatars/${req.file.filename}`;
    await store.saveUser(user);
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error("[auth/me/avatar]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Remove avatar ──
router.delete("/me/avatar", auth, async (req, res) => {
  try {
    const user = store.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.avatar_url && user.avatar_url.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", user.avatar_url);
      if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (e) {} }
    }
    user.avatar_url = null;
    await store.saveUser(user);
    res.json({ user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Providers ──
router.get("/providers", (_req, res) => {
  res.json({
    google: !!process.env.GOOGLE_CLIENT_ID,
    github: !!process.env.GITHUB_CLIENT_ID,
    discord: !!process.env.DISCORD_CLIENT_ID,
  });
});

// ── Debug ──
router.get("/debug", (_req, res) => {
  res.json({
    google_configured: !!process.env.GOOGLE_CLIENT_ID,
    github_configured: !!process.env.GITHUB_CLIENT_ID,
    discord_configured: !!process.env.DISCORD_CLIENT_ID,
    base_url: process.env.BASE_URL || "(not set)",
    client_url: process.env.CLIENT_URL || "(not set)",
    node_env: process.env.NODE_ENV || "(not set)",
  });
});

// ── OAuth: simple full-redirect flow ──
function redirectWithToken(res, token) { res.redirect(`${CLIENT_URL}/oauth/callback#token=${token}`); }
function redirectWithError(res, error) { res.redirect(`${CLIENT_URL}/oauth/callback#error=${encodeURIComponent(error)}`); }

function oauthCallback(provider) {
  return (req, res, next) => {
    passport.authenticate(provider, (err, user) => {
      if (err || !user) {
        console.error(`[oauth/${provider}] failed:`, err?.message || "no user returned");
        return redirectWithError(res, `${provider}_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  };
}
function oauthSuccess(req, res) {
  if (!req.user) return redirectWithError(res, "oauth_failed");
  const token = mintToken(req.user);
  console.log(`[oauth] ✅ ${req.user.email || req.user.id}`);
  redirectWithToken(res, token);
}

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return redirectWithError(res, "google_not_configured");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback", oauthCallback("google"), oauthSuccess);

router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) return redirectWithError(res, "github_not_configured");
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback", oauthCallback("github"), oauthSuccess);

router.get("/discord", (req, res, next) => {
  if (!process.env.DISCORD_CLIENT_ID) return redirectWithError(res, "discord_not_configured");
  passport.authenticate("discord")(req, res, next);
});
router.get("/discord/callback", oauthCallback("discord"), oauthSuccess);

module.exports = router;
