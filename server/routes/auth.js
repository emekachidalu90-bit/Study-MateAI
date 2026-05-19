const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const store      = require("../utils/store");
const passport   = require("../utils/passport");

const JWT_SECRET = process.env.JWT_SECRET || "studymate_secret_2024";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function mintToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function safeUser(u) {
  const out = { ...u };
  delete out.password;
  delete out._id;
  delete out.__v;
  out.id = u.id || u._id;
  return out;
}

// ── Register ──
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });
    if (store.users.find(u => u.email === email))
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(), name, email, password: hashed,
      avatar: name.charAt(0).toUpperCase(), oauth: {},
      streak: 0, xp: 0, level: 1,
      lastLogin: new Date().toDateString(),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    await store.save();
    console.log(`[auth] registered: ${email}`);
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

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastLogin !== today) {
      user.streak = user.lastLogin === yesterday ? (user.streak || 0) + 1 : 1;
      user.lastLogin = today;
      await store.save();
    }
    console.log(`[auth] login: ${email}`);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Me ──
router.get("/me", require("../middleware/auth"), (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(safeUser(user));
});

// ── Providers ──
router.get("/providers", (_req, res) => {
  res.json({
    google:  !!process.env.GOOGLE_CLIENT_ID,
    github:  !!process.env.GITHUB_CLIENT_ID,
    discord: !!process.env.DISCORD_CLIENT_ID,
  });
});

// ── OAuth success handler ──
// Sends a tiny HTML page that writes the JWT to localStorage then redirects.
// This is more reliable than passing the token in the URL on all browsers/proxies.
function oauthSuccess(req, res) {
  if (!req.user) {
    console.error("[oauth] callback — req.user is empty");
    return res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
  }
  const token = mintToken(req.user);
  console.log(`[oauth] ✅ signed in: ${req.user.email || req.user.id}`);
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Signing in…</title></head>
<body>
<script>
  try {
    localStorage.setItem('sm_token', ${JSON.stringify(token)});
    window.location.replace('/oauth/callback?ready=1');
  } catch(e) {
    window.location.replace('/login?error=storage_blocked');
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px;color:#888">
  Signing you in…
</p>
</body></html>`);
}

function oauthFail(provider) {
  return (req, res, next) =>
    passport.authenticate(provider, {
      failureRedirect: `${CLIENT_URL}/login?error=${provider}_failed`,
    })(req, res, next);
}

// ── Google ──
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID)
    return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback", oauthFail("google"), oauthSuccess);

// ── GitHub ──
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID)
    return res.redirect(`${CLIENT_URL}/login?error=github_not_configured`);
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback", oauthFail("github"), oauthSuccess);

// ── Discord ──
router.get("/discord", (req, res, next) => {
  if (!process.env.DISCORD_CLIENT_ID)
    return res.redirect(`${CLIENT_URL}/login?error=discord_not_configured`);
  passport.authenticate("discord")(req, res, next);
});
router.get("/discord/callback", oauthFail("discord"), oauthSuccess);

module.exports = router;
