import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { User, Zap, Star, Trophy, FileText, Layers, Gamepad2, Shield, Edit3, Check, X, Camera, TrendingUp, Award, Flame, Link2, Link2Off, KeyRound, ShieldCheck } from "lucide-react";

// ─── Provider brand icons ───
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 21.19a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

const SOCIAL_PROVIDERS = [
  { key: "google",  label: "Google",  Icon: GoogleIcon,  color: "#4285F4", bg: "rgba(66,133,244,0.08)",  border: "rgba(66,133,244,0.2)"  },
  { key: "github",  label: "GitHub",  Icon: GitHubIcon,  color: "#e6edf3", bg: "rgba(230,237,243,0.06)", border: "rgba(230,237,243,0.15)" },
  { key: "discord", label: "Discord", Icon: DiscordIcon, color: "#5865F2", bg: "rgba(88,101,242,0.08)",  border: "rgba(88,101,242,0.2)"  },
];

const ACHIEVEMENTS = [
  { id: "first_note", icon: "📄", label: "First Note", desc: "Upload or create your first note", xp: 10, check: (s) => s.notes >= 1 },
  { id: "note_collector", icon: "📚", label: "Note Collector", desc: "Create 10 notes", xp: 50, check: (s) => s.notes >= 10 },
  { id: "flashcard_maker", icon: "🃏", label: "Flashcard Maker", desc: "Generate your first flashcard set", xp: 20, check: (s) => s.flashcards >= 1 },
  { id: "quiz_master", icon: "🎯", label: "Quiz Master", desc: "Complete 5 quizzes", xp: 75, check: (s) => s.quizzes >= 5 },
  { id: "streak_3", icon: "🔥", label: "On Fire", desc: "3-day study streak", xp: 30, check: (s) => s.streak >= 3 },
  { id: "streak_7", icon: "⚡", label: "Week Warrior", desc: "7-day study streak", xp: 100, check: (s) => s.streak >= 7 },
  { id: "level_5", icon: "🌟", label: "Rising Star", desc: "Reach Level 5", xp: 50, check: (s) => s.level >= 5 },
  { id: "level_10", icon: "👑", label: "Scholar", desc: "Reach Level 10", xp: 150, check: (s) => s.level >= 10 },
];

const LEVEL_TITLES = ["Newcomer","Curious Mind","Eager Learner","Knowledge Seeker","Study Warrior","Academic","Scholar","Expert","Master","Grandmaster","Legend"];

export default function Profile() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [providers, setProviders] = useState({ google: false, github: false, discord: false });

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {});
    api.get("/auth/providers").then(r => setProviders(r.data)).catch(() => {});
  }, []);

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpInLevel = xp % 100;
  const xpPct = xpInLevel;
  const streak = user?.streak || 0;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const stats = { notes: notes.length, flashcards: notes.reduce((a, n) => a + (n.flashcards?.length || 0), 0), quizzes: 0, streak, level, xp };

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check(stats));

  const colors = ["#6C63FF", "#FF6B9D", "#43E97B", "#F7C948", "#38B2FF", "#FF6363", "#A78BFA", "#34D399"];
  const userColor = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="page" style={{ paddingTop: 32, maxWidth: 860 }}>
      {/* Profile hero card */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
        {/* Banner */}
        <div style={{ height: 100, background: `linear-gradient(135deg, ${userColor}55, ${userColor}22)`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        </div>

        <div style={{ padding: "0 28px 28px", marginTop: -40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${userColor}, ${userColor}aa)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "white", border: "3px solid var(--bg-card)" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ position: "absolute", bottom: -4, right: -4, background: "var(--accent-4)", borderRadius: 8, padding: "2px 6px", fontSize: "0.7rem", fontWeight: 800, color: "#000", border: "2px solid var(--bg-card)" }}>
                {level}
              </div>
            </div>

            {/* Edit button */}
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm"><Edit3 size={14} /> Edit Profile</button>
              : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm"><X size={14} /></button>
                  <button onClick={() => { toast.success("Profile updated!"); setEditing(false); }} className="btn btn-primary btn-sm"><Check size={14} /> Save</button>
                </div>
              )}
          </div>

          <div style={{ marginTop: 14 }}>
            {editing ? (
              <input className="input" value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ maxWidth: 280, marginBottom: 6 }} />
            ) : (
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 2 }}>{user?.name}</h2>
            )}
            <div style={{ color: userColor, fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>{levelTitle}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{user?.email}</div>
          </div>

          {/* XP Bar */}
          <div style={{ marginTop: 18, maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                <Zap size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Level {level} — {levelTitle}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{xpInLevel}/100 XP</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
              {100 - xpInLevel} XP to Level {level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {["overview", "achievements", "settings"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
            {[
              { icon: Zap, color: "var(--accent-4)", label: "Total XP", val: `${xp.toLocaleString()} XP` },
              { icon: TrendingUp, color: "var(--accent)", label: "Level", val: level },
              { icon: Flame, color: "#FF6363", label: "Day Streak", val: `${streak} 🔥` },
              { icon: FileText, color: "var(--accent-5)", label: "Notes", val: stats.notes },
              { icon: Layers, color: "var(--accent-2)", label: "Flashcards", val: stats.flashcards },
              { icon: Award, color: "var(--accent-3)", label: "Badges", val: unlockedAchievements.length },
            ].map(({ icon: Icon, color, label, val }) => (
              <div key={label} className="card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <Icon size={22} color={color} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 800, fontSize: "1.3rem", color }}>{val}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: "0.95rem" }}>🏆 Recent Achievements</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {unlockedAchievements.map(a => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(67,233,123,0.08)", border: "1px solid rgba(67,233,123,0.2)", borderRadius: 99 }}>
                    <span style={{ fontSize: "1.1rem" }}>{a.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--accent-3)" }}>{a.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{a.xp}xp</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements tab */}
      {activeTab === "achievements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent-3)" }}>✅ Unlocked ({unlockedAchievements.length})</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center", border: "1px solid rgba(67,233,123,0.25)", background: "rgba(67,233,123,0.05)" }}>
                    <span style={{ fontSize: "2rem" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--accent-3)" }}>{a.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{a.desc}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--accent-4)", marginTop: 4 }}>+{a.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, color: "var(--text-muted)" }}>🔒 Locked ({lockedAchievements.length})</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {lockedAchievements.map(a => (
                  <div key={a.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center", opacity: 0.5, filter: "grayscale(0.5)" }}>
                    <span style={{ fontSize: "2rem" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{a.desc}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>+{a.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>

          {/* ── Account info ── */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem", display:"flex", alignItems:"center", gap:8 }}>
              <User size={16} color="var(--accent)" /> Account Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="label">Display Name</label>
                <input className="input" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email</label>
                <div style={{ position:"relative" }}>
                  <input className="input" value={user?.email || "No email set"} disabled style={{ opacity: 0.55, paddingRight: 80 }} />
                  {user?.email && (
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:"0.7rem", color:"var(--accent-3)", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                      <ShieldCheck size={12}/> Verified
                    </span>
                  )}
                </div>
              </div>
              {user?.password !== undefined && user?.password !== null && (
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" value="••••••••" disabled style={{ opacity: 0.55 }} />
                </div>
              )}
              <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-end", gap: 6 }}
                onClick={() => { toast.success("Profile updated!"); setEditing(false); }}>
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>

          {/* ── Connected Social Accounts ── */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.95rem", display:"flex", alignItems:"center", gap:8 }}>
              <Link2 size={16} color="var(--accent-5)" /> Connected Accounts
            </h3>
            <p style={{ color:"var(--text-muted)", fontSize:"0.8rem", marginBottom:16, lineHeight:1.5 }}>
              Sign in faster with your social accounts. Connect multiple providers to the same StudyMate account.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {SOCIAL_PROVIDERS.map(({ key, label, Icon, color, bg, border }) => {
                const isConnected = !!user?.oauth?.[key];
                const isConfigured = providers[key];
                return (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background: isConnected ? bg : "var(--bg-secondary)", border:`1.5px solid ${isConnected ? border : "var(--border-light)"}`, borderRadius:"var(--radius-sm)", transition:"all 0.2s" }}>
                    {/* Provider icon */}
                    <div style={{ width:36, height:36, background: isConnected ? bg : "rgba(255,255,255,0.04)", border:`1px solid ${isConnected ? border : "var(--border-light)"}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon />
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:"0.88rem", color: isConnected ? color : "var(--text-primary)" }}>{label}</div>
                      <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:1 }}>
                        {!isConfigured
                          ? "Not configured on this server"
                          : isConnected
                          ? "✓ Connected — you can sign in with " + label
                          : "Not connected"}
                      </div>
                    </div>

                    {/* Action */}
                    {isConfigured && (
                      isConnected ? (
                        <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.75rem", color:"var(--accent-3)", fontWeight:700, background:"rgba(67,233,123,0.1)", padding:"4px 10px", borderRadius:99, border:"1px solid rgba(67,233,123,0.2)" }}>
                          <Check size={12}/> Connected
                        </span>
                      ) : (
                        <button
                          onClick={() => { window.location.href = `/api/auth/${key}`; }}
                          style={{ fontSize:"0.78rem", fontWeight:700, color, background: bg, border:`1px solid ${border}`, padding:"6px 14px", borderRadius:99, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap", fontFamily:"var(--font)" }}
                          onMouseEnter={e => e.currentTarget.style.transform="scale(1.04)"}
                          onMouseLeave={e => e.currentTarget.style.transform=""}>
                          Connect
                        </button>
                      )
                    )}

                    {!isConfigured && (
                      <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", background:"var(--bg-hover)", padding:"4px 10px", borderRadius:99, whiteSpace:"nowrap" }}>
                        Not set up
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Setup hint when none are configured */}
            {!providers.google && !providers.github && !providers.discord && (
              <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(247,201,72,0.06)", border:"1px solid rgba(247,201,72,0.15)", borderRadius:"var(--radius-sm)" }}>
                <p style={{ color:"var(--accent-4)", fontSize:"0.8rem", lineHeight:1.6 }}>
                  <strong>No OAuth providers configured.</strong> Add your Google / GitHub / Discord credentials to <code style={{background:"var(--bg-secondary)",padding:"1px 5px",borderRadius:4}}>.env</code> and restart the server. See the README for a step-by-step guide.
                </p>
              </div>
            )}
          </div>

          {/* ── Security ── */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem", display:"flex", alignItems:"center", gap:8 }}>
              <KeyRound size={16} color="var(--accent-2)" /> Security
            </h3>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:"0.85rem" }}>JWT Session</div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>Valid for 7 days from last sign-in</div>
              </div>
              <span className="badge badge-green" style={{ fontSize:"0.7rem" }}>Active</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:"0.85rem" }}>Account Type</div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
                  {user?.password ? "Email + Password" : "Social Login only"}
                  {user?.oauth && Object.keys(user.oauth).length > 0 && ` · ${Object.keys(user.oauth).join(", ")} linked`}
                </div>
              </div>
              <Shield size={16} color="var(--accent-3)" />
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div className="card" style={{ padding: 22, border:"1px solid rgba(255,99,99,0.15)", background:"rgba(255,99,99,0.03)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: "0.95rem", color:"#FF6363", display:"flex", alignItems:"center", gap:8 }}>
              <X size={16}/> Danger Zone
            </h3>
            <p style={{ color:"var(--text-muted)", fontSize:"0.8rem", marginBottom:14, lineHeight:1.5 }}>
              Signing out will clear your session. All your notes and progress are saved.
            </p>
            <button
              onClick={() => { if (confirm("Sign out of StudyMate?")) logout(); }}
              className="btn btn-danger w-full">
              Sign Out of StudyMate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
