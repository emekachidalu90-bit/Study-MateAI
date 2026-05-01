const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const store = require("../utils/store");
const passport = require("../utils/passport");

const JWT_SECRET = process.env.JWT_SECRET || "studymate_secret_2024";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function mintToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
}
function safeUser(user) { const { password, ...safe } = user; return safe; }

// ── Register ──
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (store.users.find((u) => u.email === email)) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, password: hashed, avatar: name.charAt(0).toUpperCase(), oauth: {}, streak: 0, xp: 0, level: 1, createdAt: new Date().toISOString() };
    store.users.push(user);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Login ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.password) return res.status(400).json({ error: "This account uses social login. Please sign in with Google, GitHub, or Discord." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });
    const today = new Date().toDateString();
    if (user.lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      user.streak = user.lastLogin === yesterday ? user.streak + 1 : 1;
      user.lastLogin = today;
    }
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Me ──
router.get("/me", require("../middleware/auth"), (req, res) => {
  const user = store.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(safeUser(user));
});

// ── Provider status ──
router.get("/providers", (req, res) => {
  res.json({ google: !!process.env.GOOGLE_CLIENT_ID, github: !!process.env.GITHUB_CLIENT_ID, discord: !!process.env.DISCORD_CLIENT_ID });
});

// ── Google ──
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: "Google OAuth not configured" });
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback",
  (req, res, next) => passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed` })(req, res, next),
  (req, res) => res.redirect(`${CLIENT_URL}/oauth/callback?token=${mintToken(req.user)}`)
);

// ── GitHub ──
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) return res.status(503).json({ error: "GitHub OAuth not configured" });
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback",
  (req, res, next) => passport.authenticate("github", { session: false, failureRedirect: `${CLIENT_URL}/login?error=github_failed` })(req, res, next),
  (req, res) => res.redirect(`${CLIENT_URL}/oauth/callback?token=${mintToken(req.user)}`)
);

// ── Discord ──
router.get("/discord", (req, res, next) => {
  if (!process.env.DISCORD_CLIENT_ID) return res.status(503).json({ error: "Discord OAuth not configured" });
  passport.authenticate("discord")(req, res, next);
});
router.get("/discord/callback",
  (req, res, next) => passport.authenticate("discord", { session: false, failureRedirect: `${CLIENT_URL}/login?error=discord_failed` })(req, res, next),
  (req, res) => res.redirect(`${CLIENT_URL}/oauth/callback?token=${mintToken(req.user)}`)
);

module.exports = router;
