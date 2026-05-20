const { createClient } = require("@supabase/supabase-js");

let _client = null;
let _connected = false;

async function connectDB() {
  const url    = process.env.SUPABASE_URL;
  const key    = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.warn("[db] ⚠️  No SUPABASE_URL / SUPABASE_SERVICE_KEY — using in-memory store (accounts lost on restart)");
    return false;
  }

  try {
    _client = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Quick connectivity test
    const { error } = await _client.from("users").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 = table empty — that's fine
      throw new Error(error.message);
    }

    _connected = true;
    console.log("[db] ✅ Supabase connected");
    return true;
  } catch (err) {
    console.error("[db] ❌ Supabase connection failed:", err.message);
    console.error("[db]    Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment");
    return false;
  }
}

const isConnected = () => _connected;
const getClient   = () => _client;

module.exports = { connectDB, isConnected, getClient };
