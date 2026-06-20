require("dotenv").config();
const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const cors     = require("cors");
const session  = require("express-session");
const path     = require("path");
const fs       = require("fs");

const { connectDB }  = require("./utils/db");
const store          = require("./utils/store");
const passport       = require("./utils/passport");
const authRoutes     = require("./routes/auth");
const notesRoutes    = require("./routes/notes");
const aiRoutes       = require("./routes/ai");
const quizRoutes     = require("./routes/quiz");
const { setupSocketHandlers } = require("./socket/quizSocket");

const app    = express();
const server = http.createServer(app);
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] } });

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(session({
  secret: process.env.JWT_SECRET || "studymate_dev_secret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 15 * 60 * 1000, httpOnly: true },
}));

app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────────────────────────
// DEBUG: log every single request that hits the server.
// Check Render logs after clicking the Google button — you
// MUST see "[req] GET /api/auth/google" in there. If you don't
// see it at all, the request never reached this server.
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─────────────────────────────────────────────────────────────
// CRITICAL: ALL /api/* ROUTES MUST BE REGISTERED BEFORE
// THE CATCH-ALL THAT SERVES index.html. THIS ORDER IS
// NON-NEGOTIABLE — Express matches routes top-to-bottom.
// ─────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai",    aiRoutes);
app.use("/api/quiz",  quizRoutes);
app.use("/uploads",   express.static(uploadsDir));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()), db: require("./utils/db").isConnected() ? "supabase" : "memory" });
});

// ── Serve built React app — STATIC FILES FIRST, CATCH-ALL LAST ──
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // This catch-all MUST be the very last route registered.
  // It only fires if nothing above matched — so /api/* routes
  // and /uploads/* always take priority.
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
  console.warn("⚠️  client/dist not found — did the build step run? (npm run build)");
}

setupSocketHandlers(io);

async function start() {
  const dbOk = await connectDB();
  if (dbOk) await store.loadFromSupabase();
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`\n✅  StudyMate on :${PORT} [${process.env.NODE_ENV || "development"}]`);
    console.log(`    DB:      ${dbOk ? "✅ Supabase" : "⚠️  Memory only"}`);
    console.log(`    BASE_URL:   ${process.env.BASE_URL   || "(not set!)"}`);
    console.log(`    CLIENT_URL: ${process.env.CLIENT_URL || "(not set!)"}`);
    console.log(`    Google:  ${process.env.GOOGLE_CLIENT_ID  ? "✅" : "❌ not set"}`);
    console.log(`    GitHub:  ${process.env.GITHUB_CLIENT_ID  ? "✅" : "❌ not set"}`);
    console.log(`    Discord: ${process.env.DISCORD_CLIENT_ID ? "✅" : "❌ not set"}\n`);
  });
}
start();
