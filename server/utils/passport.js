const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const { v4: uuidv4 } = require("uuid");
const store = require("../utils/store");

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

// ─── Serialize / Deserialize ───
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = store.users.find((u) => u.id === id);
  done(null, user || false);
});

// ─── Helper: upsert OAuth user ───
function upsertOAuthUser({ provider, providerId, name, email, avatar }) {
  // Find by provider ID first
  let user = store.users.find(
    (u) => u.oauth?.[provider] === providerId
  );

  // If not found by provider, try email (to merge accounts)
  if (!user && email) {
    user = store.users.find((u) => u.email === email);
  }

  if (user) {
    // Update provider link and freshen info
    if (!user.oauth) user.oauth = {};
    user.oauth[provider] = providerId;
    if (!user.avatar && avatar) user.avatar = avatar;
    user.lastLogin = new Date().toDateString();
    // Update streak
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    user.streak =
      user.lastLogin === yesterday ? (user.streak || 0) + 1 : 1;
  } else {
    // Create brand-new user
    user = {
      id: uuidv4(),
      name: name || "StudyMate User",
      email: email || null,
      password: null, // OAuth users have no password
      avatar: avatar || name?.charAt(0).toUpperCase() || "?",
      oauth: { [provider]: providerId },
      streak: 1,
      xp: 0,
      level: 1,
      lastLogin: new Date().toDateString(),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }

  return user;
}

// ─── Google ───
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const user = upsertOAuthUser({
            provider: "google",
            providerId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

// ─── GitHub ───
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/github/callback`,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.find((e) => e.primary)?.value ||
            profile.emails?.[0]?.value;
          const user = upsertOAuthUser({
            provider: "github",
            providerId: String(profile.id),
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

// ─── Discord ───
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/discord/callback`,
        scope: ["identify", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const avatarUrl = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null;
          const user = upsertOAuthUser({
            provider: "discord",
            providerId: profile.id,
            name: profile.global_name || profile.username,
            email: profile.email,
            avatar: avatarUrl,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

module.exports = passport;
