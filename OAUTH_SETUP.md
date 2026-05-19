# 🔐 OAuth Setup Guide

## Google
1. https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client
2. Authorized redirect URI: `https://YOUR_APP.onrender.com/api/auth/google/callback`
3. Copy Client ID and Secret → add to Render env vars as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
4. Also go to OAuth consent screen → add your domain to Authorized domains

## GitHub
1. https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Authorization callback URL: `https://YOUR_APP.onrender.com/api/auth/github/callback`
3. Generate secret → add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to Render

## Discord
1. https://discord.com/developers/applications → New Application → OAuth2
2. Add redirect: `https://YOUR_APP.onrender.com/api/auth/discord/callback`
3. Copy ID and Secret → add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to Render

## Local dev callback URLs
```
http://localhost:3001/api/auth/google/callback
http://localhost:3001/api/auth/github/callback
http://localhost:3001/api/auth/discord/callback
```

## After adding env vars
Render will redeploy. Check logs for:
```
[passport] ✅ Google ready
[passport] ✅ GitHub ready
[passport] ✅ Discord ready
```
The login page auto-detects which providers are configured and shows only those buttons.
