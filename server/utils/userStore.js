const { v4: uuidv4 } = require("uuid");

const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let supabase = null;

if (useSupabase) {
  const { createClient } = require("@supabase/supabase-js");
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const memUsers = [];

function normalizeUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    avatar: row.avatar,
    avatarUrl: row.avatar_url,
    oauth: row.oauth || {},
    streak: row.streak || 0,
    xp: row.xp || 0,
    level: row.level || 1,
    lastLogin: row.last_login,
    createdAt: row.created_at,
  };
}

function toUserRow(user) {
  return {
    id: user.id || uuidv4(),
    name: user.name,
    email: user.email,
    password: user.password || null,
    avatar: user.avatar || "S",
    avatar_url: user.avatarUrl || null,
    oauth: user.oauth || {},
    streak: user.streak || 0,
    xp: user.xp || 0,
    level: user.level || 1,
    last_login: user.lastLogin || new Date().toDateString(),
    created_at: user.createdAt || new Date().toISOString(),
  };
}

async function findByEmail(email) {
  if (!email) return null;
  if (!useSupabase) return memUsers.find(u => u.email === email) || null;
  const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return normalizeUserRow(data);
}

async function findById(id) {
  if (!id) return null;
  if (!useSupabase) return memUsers.find(u => u.id === id) || null;
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return normalizeUserRow(data);
}

async function findByOAuth(provider, providerId) {
  if (!provider || !providerId) return null;
  if (!useSupabase) return memUsers.find(u => u.oauth?.[provider] === String(providerId)) || null;
  const { data, error } = await supabase.from("users").select("*").contains("oauth", { [provider]: String(providerId) }).maybeSingle();
  if (error) throw error;
  return normalizeUserRow(data);
}

async function save(user) {
  if (!useSupabase) {
    const idx = memUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) memUsers[idx] = user;
    else memUsers.push(user);
    return user;
  }
  const row = toUserRow(user);
  const { data, error } = await supabase.from("users").upsert(row).select("*").single();
  if (error) throw error;
  return normalizeUserRow(data);
}

module.exports = {
  isSupabase: () => useSupabase,
  findByEmail,
  findById,
  findByOAuth,
  save,
};
