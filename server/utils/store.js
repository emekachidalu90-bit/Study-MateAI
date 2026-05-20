/**
 * Unified data store — Supabase (PostgreSQL) + in-memory fallback.
 *
 * With SUPABASE_URL + SUPABASE_SERVICE_KEY set:
 *   → reads/writes Supabase permanently (survives all Render restarts)
 *
 * Without them:
 *   → pure in-memory only (fine for local dev, lost on Render restart)
 *
 * All routes use the simple array API:
 *   store.users / store.notes
 *   await store.save()
 *   await store.deleteNote(id)
 */

const { isConnected, getClient } = require("./db");

const store = {
  users:     [],
  notes:     [],
  quizRooms: new Map(),   // always in-memory (intentional)

  // ── Load from Supabase into memory on startup ──────────────
  async loadFromSupabase() {
    if (!isConnected()) return;
    const db = getClient();
    try {
      const [{ data: users, error: ue }, { data: notes, error: ne }] = await Promise.all([
        db.from("users").select("*"),
        db.from("notes").select("*"),
      ]);
      if (ue) throw new Error("users: " + ue.message);
      if (ne) throw new Error("notes: " + ne.message);
      this.users = users || [];
      this.notes = notes || [];
      console.log(`[store] loaded ${this.users.length} users, ${this.notes.length} notes from Supabase`);
    } catch (err) {
      console.error("[store] loadFromSupabase error:", err.message);
    }
  },

  // ── Persist (upsert) all users + notes ────────────────────
  async save() {
    if (!isConnected()) return;
    const db = getClient();
    try {
      // Upsert users
      if (this.users.length) {
        const { error } = await db
          .from("users")
          .upsert(this.users, { onConflict: "id" });
        if (error) throw new Error("users upsert: " + error.message);
      }
      // Upsert notes
      if (this.notes.length) {
        const { error } = await db
          .from("notes")
          .upsert(this.notes, { onConflict: "id" });
        if (error) throw new Error("notes upsert: " + error.message);
      }
    } catch (err) {
      console.error("[store] save error:", err.message);
    }
  },

  // ── Save a single user (faster than full save) ────────────
  async saveUser(user) {
    if (!isConnected()) return;
    const db = getClient();
    try {
      const { error } = await db.from("users").upsert(user, { onConflict: "id" });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error("[store] saveUser error:", err.message);
    }
  },

  // ── Save a single note (faster than full save) ────────────
  async saveNote(note) {
    if (!isConnected()) return;
    const db = getClient();
    try {
      const { error } = await db.from("notes").upsert(note, { onConflict: "id" });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error("[store] saveNote error:", err.message);
    }
  },

  // ── Delete a single note ──────────────────────────────────
  async deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    if (!isConnected()) return;
    const db = getClient();
    try {
      const { error } = await db.from("notes").delete().eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error("[store] deleteNote error:", err.message);
    }
  },
};

module.exports = store;
