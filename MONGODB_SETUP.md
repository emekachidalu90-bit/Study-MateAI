# 🗄️ MongoDB Atlas Setup (Free — Permanent Storage)

This fixes accounts disappearing on Render. Takes ~5 minutes.

---

## Step 1 — Create a free MongoDB Atlas account

1. Go to https://cloud.mongodb.com
2. Sign up (free — no credit card needed)
3. Choose **Free Shared** cluster (M0)
4. Pick any region close to your Render deployment
5. Click **Create Cluster** (takes ~2 minutes to provision)

---

## Step 2 — Create a database user

1. In the left sidebar click **Database Access**
2. Click **Add New Database User**
3. Authentication: **Password**
4. Username: `studymate`
5. Password: click **Autogenerate** and **copy it somewhere safe**
6. Role: **Atlas Admin** (or "Read and write to any database")
7. Click **Add User**

---

## Step 3 — Allow connections from anywhere (for Render)

1. In the left sidebar click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
4. Click **Confirm**

---

## Step 4 — Get your connection string

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://studymate:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved in Step 2
7. Add your database name before the `?`:
   ```
   mongodb+srv://studymate:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studymate?retryWrites=true&w=majority
   ```

---

## Step 5 — Add to Render

1. Go to your Render service → **Environment**
2. Add a new variable:
   - **Key:** `MONGODB_URI`
   - **Value:** your full connection string from Step 4
3. Click **Save Changes**
4. Render will redeploy automatically

---

## Step 6 — Verify it's working

In Render's logs you should see:
```
[db] ✅ MongoDB connected
[store] MongoDB loaded: 0 users, 0 notes
✅  StudyMate on :3001 [production]
    DB: MongoDB ✅
```

Now register a new account — it will be stored permanently in MongoDB and survive all Render restarts/spindowns.

---

## Testing locally

Add to your `.env` file:
```
MONGODB_URI=mongodb+srv://studymate:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studymate?retryWrites=true&w=majority
```

Or leave it empty to use the local file store during development.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `[db] ❌ MongoDB connection failed: bad auth` | Wrong password in the URI — regenerate in Atlas → Database Access |
| `[db] ❌ connection timed out` | IP not whitelisted — go to Network Access and add `0.0.0.0/0` |
| Still losing data after adding MONGODB_URI | Check Render logs — the URI might have a typo |
| `MongoServerError: bad auth` | Make sure you replaced `<password>` in the URI |
