# 🗄️ MongoDB Atlas Setup (Free — Permanent Storage)

Accounts disappear on Render free tier because the filesystem resets.
MongoDB Atlas stores your data permanently in the cloud. Takes 5 minutes.

---

## Step 1 — Create free Atlas account
1. Go to https://cloud.mongodb.com and sign up (free, no credit card)
2. Create a **Free (M0)** cluster in any region

## Step 2 — Create a database user
1. Sidebar → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `studymate`, Password: click **Autogenerate** → copy it
4. Role: **Atlas Admin** → **Add User**

## Step 3 — Allow all IPs (for Render)
1. Sidebar → **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0) → **Confirm**

## Step 4 — Get connection string
1. Sidebar → **Database** → **Connect** → **Drivers**
2. Copy the URI — looks like:
   ```
   mongodb+srv://studymate:<password>@cluster0.xxxxx.mongodb.net/
   ```
3. Replace `<password>` with your password and add database name:
   ```
   mongodb+srv://studymate:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studymate?retryWrites=true&w=majority
   ```

## Step 5 — Add to Render
1. Render → your service → **Environment**
2. Add: `MONGODB_URI` = your full connection string
3. Also add: `BASE_URL` = `https://your-app.onrender.com`
4. Also add: `CLIENT_URL` = `https://your-app.onrender.com`
5. **Save Changes** → Render redeploys

## Verify in Render logs:
```
[db] ✅ MongoDB connected
[store] loaded 0 users, 0 notes from MongoDB
    Database: ✅ MongoDB (permanent)
```

## Troubleshooting
| Problem | Fix |
|---|---|
| `bad auth` | Wrong password in URI |
| Connection timeout | Add 0.0.0.0/0 in Network Access |
| Still losing data | Check MONGODB_URI is set in Render env vars |
