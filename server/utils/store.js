/**
 * Unified data store.
 * With MONGODB_URI set  → reads/writes MongoDB Atlas (permanent).
 * Without MONGODB_URI   → pure in-memory (dev only, lost on restart).
 *
 * All routes use the same simple array API: store.users / store.notes
 * Call await store.save() after any mutation.
 */

const { isConnected } = require("./db");

const store = {
  users:     [],
  notes:     [],
  quizRooms: new Map(),

  // ── Load from MongoDB into memory on startup ──────────────
  async loadFromMongo() {
    if (!isConnected()) return;
    const User = require("../models/User");
    const Note = require("../models/Note");
    const [users, notes] = await Promise.all([User.find().lean(), Note.find().lean()]);
    this.users = users.map(u => ({ ...u, id: u._id }));
    this.notes = notes.map(n => ({ ...n, id: n._id }));
    console.log(`[store] loaded ${this.users.length} users, ${this.notes.length} notes from MongoDB`);
  },

  // ── Persist in-memory arrays back to MongoDB ─────────────
  async save() {
    if (!isConnected()) return; // in-memory only — nothing to do
    try {
      const User = require("../models/User");
      const Note = require("../models/Note");

      const userOps = this.users.map(u => ({
        updateOne: {
          filter: { _id: u.id || u._id },
          update: { $set: { ...u, _id: u.id || u._id } },
          upsert: true,
        },
      }));
      const noteOps = this.notes.map(n => ({
        updateOne: {
          filter: { _id: n.id || n._id },
          update: { $set: { ...n, _id: n.id || n._id } },
          upsert: true,
        },
      }));

      if (userOps.length) await User.bulkWrite(userOps, { ordered: false });
      if (noteOps.length) await Note.bulkWrite(noteOps, { ordered: false });
    } catch (err) {
      console.error("[store] save error:", err.message);
    }
  },

  // ── Delete a single note from MongoDB ────────────────────
  async deleteNote(id) {
    this.notes = this.notes.filter(n => (n.id || n._id) !== id);
    if (!isConnected()) return;
    try {
      const Note = require("../models/Note");
      await Note.deleteOne({ _id: id });
    } catch (err) {
      console.error("[store] deleteNote error:", err.message);
    }
  },
};

module.exports = store;
