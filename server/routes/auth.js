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
    const user = { id: uuidv4(), name, email, password: hashed, avatar: name.charAt(0).toUpperCase(), oauth: {}, streak: 0, xp: 0, level: 1, last_login: new Date().toDateString(), created_at: new Date().toISOString() };
    store.users.push(user);
    await store.saveUser(user);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
    if (user.last_login !== today) {
      user.streak = user.last_login === yesterday ? (user.streak || 0) + 1 : 1;
      user.last_login = today;
      await store.saveUser(user);
    }
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// ── Debug ──
router.get("/debug", (_req, res) => {
  res.json({
    google_configured:  !!process.env.GOOGLE_CLIENT_ID,
    github_configured:  !!process.env.GITHUB_CLIENT_ID,
    discord_configured: !!process.env.DISCORD_CLIENT_ID,
    base_url:   process.env.BASE_URL   || "(not set)",
    client_url: process.env.CLIENT_URL || "(not set)",
    node_env:   process.env.NODE_ENV   || "(not set)",
  });
});

// ─────────────────────────────────────────────────────────────
// SIMPLE FULL-REDIRECT OAUTH — no popup, no postMessage, no
// BroadcastChannel. This is the most reliable approach and
// works identically in a normal browser tab AND an installed
// PWA, because there is only ever ONE window involved.
//
// Flow:
//   1. Click button → window.location.href = /api/auth/google
//   2. Google does its thing, redirects back to our callback
//   3. Server mints a JWT and redirects to:
//        CLIENT_URL/oauth/callback#token=XXXX
//      (token in the URL FRAGMENT, not query string — fragments
//      are never sent to the server on the next request and are
//      simple for the client to read with window.location.hash)
//   4. OAuthCallback.jsx reads the hash, stores it, calls
//      /auth/me, navigates to /dashboard.
// ─────────────────────────────────────────────────────────────

function redirectWithToken(res, token) {
  res.redirect(`${CLIENT_URL}/oauth/callback#token=${token}`);
}
function redirectWithError(res, error) {
  res.redirect(`${CLIENT_URL}/oauth/callback#error=${encodeURIComponent(error)}`);
}

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

// ── Google ──
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return redirectWithError(res, "google_not_configured");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback", oauthCallback("google"), oauthSuccess);

// ── GitHub ──
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) return redirectWithError(res, "github_not_configured");
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback", oauthCallback("github"), oauthSuccess);

// ── Discord ──
router.get("/discord", (req, res, next) => {
  if (!process.env.DISCORD_CLIENT_ID) return redirectWithError(res, "discord_not_configured");
  passport.authenticate("discord")(req, res, next);
});
router.get("/discord/callback", oauthCallback("discord"), oauthSuccess);

module.exports = router;
