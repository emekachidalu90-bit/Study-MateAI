const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema({
  _id:       { type: String, default: uuidv4 },
  name:      { type: String, required: true },
  email:     { type: String, default: null },
  password:  { type: String, default: null },
  avatar:    { type: String, default: "?" },
  avatarUrl: { type: String, default: null },
  oauth:     { type: Object, default: {} },
  streak:    { type: Number, default: 0 },
  xp:        { type: Number, default: 0 },
  level:     { type: Number, default: 1 },
  lastLogin: { type: String, default: null },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { _id: false, versionKey: false });

UserSchema.virtual("id").get(function () { return this._id; });
UserSchema.set("toJSON",   { virtuals: true, transform: (_, ret) => { delete ret._id; return ret; } });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
