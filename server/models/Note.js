const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const NoteSchema = new mongoose.Schema({
  _id:          { type: String, default: uuidv4 },
  userId:       { type: String, required: true, index: true },
  title:        { type: String, required: true },
  content:      { type: String, default: "" },
  filePath:     { type: String, default: null },
  originalName: { type: String, default: null },
  mimetype:     { type: String, default: null },
  size:         { type: Number, default: 0 },
  type:         { type: String, default: "text" },
  tags:         { type: [String], default: [] },
  summary:      { type: String, default: "" },
  flashcards:   { type: Array, default: [] },
  createdAt:    { type: String, default: () => new Date().toISOString() },
  updatedAt:    { type: String, default: () => new Date().toISOString() },
}, { _id: false, versionKey: false });

NoteSchema.virtual("id").get(function () { return this._id; });
NoteSchema.set("toJSON",   { virtuals: true, transform: (_, ret) => { delete ret._id; return ret; } });
NoteSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Note || mongoose.model("Note", NoteSchema);
