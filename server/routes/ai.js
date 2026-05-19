const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const store   = require("../utils/store");

function getGroq() {
  const Groq = require("groq-sdk");
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set in environment variables");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function groqChat(messages, model = "llama3-8b-8192") {
  const groq = getGroq();
  const res = await groq.chat.completions.create({ model, messages, max_tokens: 2048, temperature: 0.3 });
  return res.choices[0]?.message?.content || "";
}

// ── Summarize ──
router.post("/summarize/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find(n => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const summary = await groqChat([
      { role: "system", content: "You are a study assistant. Summarize the content clearly and concisely using bullet points. Preserve key concepts, definitions, and important points." },
      { role: "user", content: `Summarize this study material:\n\n${note.content.slice(0, 8000)}` },
    ]);
    note.summary = summary;
    note.updatedAt = new Date().toISOString();
    await store.save();
    res.json({ summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Flashcards ──
router.post("/flashcards/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find(n => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const count = req.body.count || 10;
    const raw = await groqChat([
      { role: "system", content: `Generate exactly ${count} flashcard pairs. Return ONLY a valid JSON array with no extra text, no markdown, no backticks:\n[{"front":"question","back":"answer"}]` },
      { role: "user", content: `Create ${count} flashcards from:\n\n${note.content.slice(0, 8000)}` },
    ]);

    let flashcards = [];
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) flashcards = JSON.parse(match[0]);
    } catch { flashcards = []; }

    note.flashcards = flashcards;
    note.updatedAt = new Date().toISOString();
    await store.save();
    res.json({ flashcards });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Generate quiz questions ──
router.post("/generate-quiz", auth, async (req, res) => {
  try {
    const { content, count = 10, difficulty = "medium" } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    const raw = await groqChat([
      {
        role: "system",
        content: `You are a quiz creator. Generate exactly ${count} multiple-choice questions at ${difficulty} difficulty.
Return ONLY a valid JSON array with no extra text, no markdown, no backticks:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]
"correct" is the 0-based index of the right answer.`,
      },
      { role: "user", content: `Generate ${count} quiz questions from:\n\n${content.slice(0, 8000)}` },
    ]);

    let questions = [];
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) questions = JSON.parse(match[0]);
    } catch { questions = []; }

    if (!questions.length) return res.status(500).json({ error: "Could not generate questions. Try different content." });
    res.json({ questions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI Tutor chat ──
router.post("/tutor", auth, async (req, res) => {
  try {
    const { messages, noteContext } = req.body;
    const systemPrompt = noteContext
      ? `You are StudyMate AI, a friendly and knowledgeable study tutor. The student is studying:\n\n${noteContext.slice(0, 4000)}\n\nAnswer questions, explain concepts clearly with examples, and be encouraging.`
      : "You are StudyMate AI, a friendly and knowledgeable study tutor. Help students understand any topic with clear explanations and examples.";

    const reply = await groqChat([
      { role: "system", content: systemPrompt },
      ...messages.slice(-10),
    ]);
    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Explain a concept ──
router.post("/explain", auth, async (req, res) => {
  try {
    const { term, context } = req.body;
    const reply = await groqChat([
      { role: "system", content: "You are a study assistant. Explain concepts clearly with examples. Use simple language." },
      { role: "user", content: `Explain "${term}"${context ? ` in the context of: ${context}` : ""}` },
    ]);
    res.json({ explanation: reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Study plan ──
router.post("/study-plan", auth, async (req, res) => {
  try {
    const { subject, duration, goals } = req.body;
    const reply = await groqChat([
      { role: "system", content: "You are a study coach. Create detailed, actionable study plans with time blocks, topics, and strategies. Use markdown formatting." },
      { role: "user", content: `Create a study plan for:\nSubject: ${subject}\nTime available: ${duration}\nGoals: ${goals}` },
    ]);
    res.json({ plan: reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Mind map (FIXED) ──
router.post("/mindmap/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find(n => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const raw = await groqChat([
      {
        role: "system",
        content: `You are a mind map generator. Analyze the study material and return ONLY a valid JSON object — no extra text, no markdown, no backticks, no explanation:
{"center":"Main Topic","branches":[{"label":"Branch Name","children":["detail 1","detail 2","detail 3"]}]}
Generate 4 to 6 branches, each with 2 to 4 children. Keep labels short (under 6 words).`,
      },
      { role: "user", content: `Generate a mind map for this material:\n\n${note.content.slice(0, 6000)}` },
    ]);

    let mindmap = null;
    try {
      // Strip any markdown fences if present
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) mindmap = JSON.parse(match[0]);
    } catch {}

    // Fallback if JSON parse fails
    if (!mindmap || !mindmap.center) {
      mindmap = {
        center: note.title,
        branches: [
          { label: "Key Concepts", children: ["Review your notes", "Identify main ideas"] },
          { label: "Details", children: ["See note content", "Add more notes for better results"] },
        ],
      };
    }

    res.json({ mindmap });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
