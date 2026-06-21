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

app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ═══════════════════════════════════════════════════════════════
// STEP 1 of 3: API ROUTES — registered FIRST, always win.
// ═══════════════════════════════════════════════════════════════
app.use("/api/auth",  authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai",    aiRoutes);
app.use("/api/quiz",  quizRoutes);
app.use("/uploads",   express.static(uploadsDir));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()), db: require("./utils/db").isConnected() ? "supabase" : "memory" });
});

// ═══════════════════════════════════════════════════════════════
// STEP 2 of 3: STATIC REACT BUILD FILES (JS, CSS, images etc.)
// These are real files on disk — express.static only responds
// to ones that actually exist, then calls next() otherwise.
// ═══════════════════════════════════════════════════════════════
const clientDist = path.join(__dirname, "../client/dist");
const hasClientBuild = fs.existsSync(clientDist);
if (hasClientBuild) {
  app.use(express.static(clientDist));
} else {
  console.warn("⚠️  client/dist not found — did the build step run? (npm run build)");
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 of 3: SPA CATCH-ALL — must be the absolute last route.
//
// EXPLICITLY refuses to handle anything starting with /api or
// /uploads, even as a safety net in case something above this
// line is ever reordered by mistake in the future. This line
// is what was MISSING before, and is the actual root cause of
// "/healthz" and "/api/auth/debug" returning index.html.
// ═══════════════════════════════════════════════════════════════
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    return res.status(404).json({ error: "Not found", path: req.path });
  }
  if (!hasClientBuild) {
    return res.status(503).send("Client build not found. Check Render build logs.");
  }
  res.sendFile(path.join(clientDist, "index.html"));
});

setupSocketHandlers(io);

async function start() {
  const dbOk = await connectDB();
  if (dbOk) await store.loadFromSupabase();
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`\n✅  StudyMate on :${PORT} [${process.env.NODE_ENV || "development"}]`);
    console.log(`    Client build: ${hasClientBuild ? "✅ found" : "❌ MISSING"}`);
    console.log(`    DB:           ${dbOk ? "✅ Supabase" : "⚠️  Memory only"}`);
    console.log(`    BASE_URL:     ${process.env.BASE_URL   || "(not set!)"}`);
    console.log(`    CLIENT_URL:   ${process.env.CLIENT_URL || "(not set!)"}`);
    console.log(`    Google:       ${process.env.GOOGLE_CLIENT_ID  ? "✅" : "❌ not set"}`);
    console.log(`    GitHub:       ${process.env.GITHUB_CLIENT_ID  ? "✅" : "❌ not set"}`);
    console.log(`    Discord:      ${process.env.DISCORD_CLIENT_ID ? "✅" : "❌ not set"}\n`);
  });
}
start();
