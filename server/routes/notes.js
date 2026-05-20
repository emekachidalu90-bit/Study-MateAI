const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const { v4: uuidv4 } = require("uuid");
const auth    = require("../middleware/auth");
const store   = require("../utils/store");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(pdf|docx?|pptx?|xlsx?|txt|md|json)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error("Unsupported file type"));
  },
});

async function extractText(filePath, originalname) {
  const ext = path.extname(originalname).toLowerCase();
  try {
    if (ext === ".pdf") {
      const pdfParse = require("pdf-parse");
      return (await pdfParse(fs.readFileSync(filePath))).text;
    }
    if ([".docx", ".doc"].includes(ext)) {
      const mammoth = require("mammoth");
      return (await mammoth.extractRawText({ path: filePath })).value;
    }
    if ([".pptx", ".ppt"].includes(ext)) {
      try {
        const AdmZip = require("adm-zip");
        const zip = new AdmZip(filePath);
        let text = "";
        zip.getEntries().forEach(e => {
          if (/ppt\/slides\/slide\d+\.xml/.test(e.entryName)) {
            (e.getData().toString("utf8").match(/<a:t>(.*?)<\/a:t>/g) || [])
              .forEach(m => { text += m.replace(/<[^>]*>/g, "") + " "; });
          }
        });
        return text || "Presentation uploaded — limited text extraction.";
      } catch { return "Presentation uploaded."; }
    }
    if ([".xlsx", ".xls"].includes(ext)) {
      const XLSX = require("xlsx");
      const wb = XLSX.readFile(filePath);
      return wb.SheetNames.map(n => `Sheet: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`).join("\n");
    }
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    return `Could not extract text: ${err.message}`;
  }
}

// ── Upload file ──
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const content = await extractText(req.file.path, req.file.originalname);
    const note = {
      id: uuidv4(), user_id: req.user.id,
      title: req.body.title || req.file.originalname.replace(/\.[^.]+$/, ""),
      content, file_path: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype, size: req.file.size,
      type: "file",
      tags: req.body.tags ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      summary: "", flashcards: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    store.notes.push(note);
    await store.saveNote(note);

    // Update user XP
    const user = store.users.find(u => u.id === req.user.id);
    if (user) {
      user.xp = (user.xp || 0) + 10;
      user.level = Math.floor(user.xp / 100) + 1;
      await store.saveUser(user);
    }
    res.json(note);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Create text note ──
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });
    const note = {
      id: uuidv4(), user_id: req.user.id, title, content, type: "text",
      tags: tags || [], summary: "", flashcards: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    store.notes.push(note);
    await store.saveNote(note);

    const user = store.users.find(u => u.id === req.user.id);
    if (user) {
      user.xp = (user.xp || 0) + 5;
      user.level = Math.floor(user.xp / 100) + 1;
      await store.saveUser(user);
    }
    res.json(note);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Get all user notes ──
router.get("/", auth, (req, res) => {
  res.json(store.notes.filter(n => n.user_id === req.user.id));
});

// ── Get single note ──
router.get("/:id", auth, (req, res) => {
  const note = store.notes.find(n => n.id === req.params.id && n.user_id === req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// ── Update note ──
router.put("/:id", auth, async (req, res) => {
  try {
    const idx = store.notes.findIndex(n => n.id === req.params.id && n.user_id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: "Note not found" });
    store.notes[idx] = { ...store.notes[idx], ...req.body, updated_at: new Date().toISOString() };
    await store.saveNote(store.notes[idx]);
    res.json(store.notes[idx]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Delete note ──
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = store.notes.find(n => n.id === req.params.id && n.user_id === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (note.file_path) {
      const fp = path.join(__dirname, "../uploads", note.file_path);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await store.deleteNote(note.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
