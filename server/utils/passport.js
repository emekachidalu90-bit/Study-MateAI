const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const store = require("./store");
const { applyLoginStreak } = require("./streak");

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, store.users.find(u => u.id === id) || false));

async function upsertOAuthUser({ provider, providerId, name, email, avatar }) {
  let user = store.users.find(u => u.oauth?.[provider] === String(providerId));
  if (!user && email) user = store.users.find(u => u.email === email);

  if (user) {
    if (!user.oauth) user.oauth = {};
    user.oauth[provider] = String(providerId);
    // Only use the OAuth provider's avatar if the user hasn't set a custom one
    if (!user.avatar_url && avatar) user.avatar_url = avatar;
    applyLoginStreak(user);
  } else {
    user = {
      id: uuidv4(),
      name: name || "StudyMate User",
      email: email || null,
      password: null,
      avatar: (name || "S").charAt(0).toUpperCase(),
      avatar_url: avatar || null,
      oauth: { [provider]: String(providerId) },
      streak: 0,
      xp: 0,
      level: 1,
      last_login_date: null,
      created_at: new Date().toISOString(),
    };
    applyLoginStreak(user); // sets streak = 1 on first login
    store.users.push(user);
  }

  await store.saveUser(user);
  return user;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { Strategy: G } = require("passport-google-oauth20");
  passport.use(new G(
    { clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/google/callback` },
    async (_a, _r, p, done) => {
      try {
        done(null, await upsertOAuthUser({ provider: "google", providerId: p.id, name: p.displayName, email: p.emails?.[0]?.value, avatar: p.photos?.[0]?.value }));
      } catch (e) { done(e); }
    }
  ));
  console.log("[passport] ✅ Google");
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const { Strategy: GH } = require("passport-github2");
  passport.use(new GH(
    { clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/github/callback` },
    async (_a, _r, p, done) => {
      try {
        const email = p.emails?.find(e => e.primary)?.value || p.emails?.[0]?.value;
        done(null, await upsertOAuthUser({ provider: "github", providerId: String(p.id), name: p.displayName || p.username, email, avatar: p.photos?.[0]?.value }));
      } catch (e) { done(e); }
    }
  ));
  console.log("[passport] ✅ GitHub");
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  const { Strategy: D } = require("passport-discord");
  passport.use(new D(
    { clientID: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET, callbackURL: `${BASE_URL}/api/auth/discord/callback`, scope: ["identify", "email"] },
    async (_a, _r, p, done) => {
      try {
        const av = p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : null;
        done(null, await upsertOAuthUser({ provider: "discord", providerId: p.id, name: p.global_name || p.username, email: p.email, avatar: av }));
      } catch (e) { done(e); }
    }
  ));
  console.log("[passport] ✅ Discord");
}

module.exports = passport;
