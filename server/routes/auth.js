const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const store      = require("../utils/store");
const passport   = require("../utils/passport");

const JWT_SECRET = process.env.JWT_SECRET || "studymate_secret_2024";

function mintToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function safeUser(u) {
  const { password, ...safe } = u;
  return safe;
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
      last_login: new Date().toDateString(),
      created_at: new Date().toISOString(),
    };
    store.users.push(user);
    await store.saveUser(user);
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
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
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.last_login !== today) {
      user.streak     = user.last_login === yesterday ? (user.streak || 0) + 1 : 1;
      user.last_login = today;
      await store.saveUser(user);
    }
    res.json({ token: mintToken(user), user: safeUser(user) });
  } catch (err) {
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

// ── Debug — visit /api/auth/debug on Render to verify env vars ──
router.get("/debug", (_req, res) => {
  res.json({
    google_configured:   !!process.env.GOOGLE_CLIENT_ID,
    github_configured:   !!process.env.GITHUB_CLIENT_ID,
    discord_configured:  !!process.env.DISCORD_CLIENT_ID,
    base_url:            process.env.BASE_URL   || "(not set — OAuth callbacks will break!)",
    client_url:          process.env.CLIENT_URL || "(not set)",
    node_env:            process.env.NODE_ENV   || "(not set)",
    passport_strategies: Object.keys(passport._strategies || {}).filter(s => s !== "session"),
  });
});

// ─────────────────────────────────────────────────────────────
// POPUP PAGE
// Every OAuth outcome renders this minimal HTML page inside
// the popup window. It NEVER loads the full React app.
// It posts a message back to the opener/BroadcastChannel
// and closes itself.
// ─────────────────────────────────────────────────────────────
function popupPage(token, error) {
  const msg = error
    ? { type: "OAUTH_ERROR", error }
    : { type: "OAUTH_SUCCESS", token };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${error ? "Sign-in error" : "Signing in…"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0F0F1A; color: #F0F0FF;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; padding: 24px;
      text-align: center;
    }
    .icon { font-size: 3rem; margin-bottom: 16px; }
    .msg  { color: #9090B8; font-size: 1rem; line-height: 1.5; max-width: 300px; }
    .err  { color: #FF6363; }
  </style>
</head>
<body>
  <div class="icon">${error ? "⚠️" : "✅"}</div>
  <p class="msg ${error ? "err" : ""}">${error || "Signing you in…"}</p>

  <script>
    (function() {
      var payload = ${JSON.stringify(msg)};

      // Store token immediately if we have one
      if (payload.token) {
        try { localStorage.setItem("sm_token", payload.token); } catch(e) {}
      }

      var sent = false;

      // Method 1: postMessage to opener (normal browser popup)
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(payload, "*");
          sent = true;
        } catch(e) {}
      }

      // Method 2: BroadcastChannel (PWA standalone where opener = null)
      try {
        var bc = new BroadcastChannel("sm_oauth");
        bc.postMessage(payload);
        setTimeout(function() { try { bc.close(); } catch(e) {} }, 2000);
        sent = true;
      } catch(e) {}

      // Close popup after a short delay
      setTimeout(function() {
        window.close();
        // If window.close() didn't work (e.g. direct navigation fallback),
        // redirect to the callback page which handles the token from localStorage
        setTimeout(function() {
          window.location.replace("/oauth/callback?ready=1");
        }, 400);
      }, 800);
    })();
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// OAuth middleware — custom callback so failures show
// the popup page instead of redirecting to the React app
// ─────────────────────────────────────────────────────────────
function oauthCallback(provider) {
  return (req, res, next) => {
    passport.authenticate(provider, (err, user) => {
      if (err || !user) {
        const msg = err?.message || `${provider} sign-in was cancelled or failed.`;
        console.error(`[oauth/${provider}] failed:`, msg);
        return res.send(popupPage(null, "Sign-in failed. Please close this window and try again."));
      }
      req.user = user;
      next();
    })(req, res, next);
  };
}

function oauthSuccess(req, res) {
  if (!req.user) {
    return res.send(popupPage(null, "Sign-in failed. Please try again."));
  }
  const token = mintToken(req.user);
  console.log(`[oauth] ✅ ${req.user.email || req.user.id}`);
  res.send(popupPage(token, null));
}

// ── Google ──
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.send(popupPage(null,
      "Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your Render environment variables, then redeploy."
    ));
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback", oauthCallback("google"), oauthSuccess);

// ── GitHub ──
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return res.send(popupPage(null, "GitHub sign-in is not configured on this server."));
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback", oauthCallback("github"), oauthSuccess);

// ── Discord ──
router.get("/discord", (req, res, next) => {
  if (!process.env.DISCORD_CLIENT_ID) {
    return res.send(popupPage(null, "Discord sign-in is not configured on this server."));
  }
  passport.authenticate("discord")(req, res, next);
});
router.get("/discord/callback", oauthCallback("discord"), oauthSuccess);

module.exports = router;
