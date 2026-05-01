require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const session = require("express-session");
const passport = require("./utils/passport");
const path = require("path");
const fs = require("fs");

const authRoutes  = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const aiRoutes    = require("./routes/ai");
const quizRoutes  = require("./routes/quiz");
const { setupSocketHandlers } = require("./socket/quizSocket");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET","POST"] },
});

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Session needed for OAuth redirect dance (short-lived only)
app.use(session({
  secret: process.env.JWT_SECRET || "studymate_session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production", maxAge: 10 * 60 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/api/auth",  authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai",    aiRoutes);
app.use("/api/quiz",  quizRoutes);
app.use("/uploads",   express.static(uploadsDir));

const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✅  StudyMate running on :${PORT}`));
