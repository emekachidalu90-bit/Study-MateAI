import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Zap, TrendingUp, FileText, Layers, Award, Flame, Check, Link2, ShieldCheck, KeyRound, Camera, Trash2, Loader, X } from "lucide-react";

const GoogleIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
const GitHubIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const DiscordIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 21.19a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;

const ACHIEVEMENTS = [
  { id:"first_note",     icon:"📄", label:"First Note",      desc:"Create your first note",        xp:10,  check:s=>s.notes>=1 },
  { id:"notes_10",       icon:"📚", label:"Note Collector",  desc:"Create 10 notes",               xp:50,  check:s=>s.notes>=10 },
  { id:"flashcards",     icon:"🃏", label:"Flashcard Maker", desc:"Generate a flashcard set",      xp:20,  check:s=>s.flashcards>=1 },
  { id:"streak_3",       icon:"🔥", label:"On Fire",         desc:"3-day streak",                  xp:30,  check:s=>s.streak>=3 },
  { id:"streak_7",       icon:"⚡", label:"Week Warrior",    desc:"7-day streak",                  xp:100, check:s=>s.streak>=7 },
  { id:"level_5",        icon:"🌟", label:"Rising Star",     desc:"Reach Level 5",                 xp:50,  check:s=>s.level>=5 },
  { id:"level_10",       icon:"👑", label:"Scholar",         desc:"Reach Level 10",                xp:150, check:s=>s.level>=10 },
];

const PROVIDERS = [
  { key:"google",  label:"Google",  Icon:GoogleIcon,  color:"#4285F4", bg:"rgba(66,133,244,0.08)",  border:"rgba(66,133,244,0.2)"  },
  { key:"github",  label:"GitHub",  Icon:GitHubIcon,  color:"#e6edf3", bg:"rgba(230,237,243,0.06)", border:"rgba(230,237,243,0.15)" },
  { key:"discord", label:"Discord", Icon:DiscordIcon, color:"#5865F2", bg:"rgba(88,101,242,0.08)",  border:"rgba(88,101,242,0.2)"  },
];

export default function Profile() {
  const { user, logout, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const [notes, setNotes]       = useState([]);
  const [tab, setTab]           = useState("overview");
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [providers, setProviders] = useState({ google:false, github:false, discord:false });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {});
    api.get("/auth/providers").then(r => setProviders(r.data)).catch(() => {});
  }, []);

  // Keep the name input in sync if the user object refreshes elsewhere
  useEffect(() => { setNameInput(user?.name || ""); }, [user?.name]);

  const xp = user?.xp || 0, level = user?.level || 1, xpPct = xp % 100, streak = user?.streak || 0;
  const stats = { notes: notes.length, flashcards: notes.reduce((a,n) => a + (n.flashcards?.length||0), 0), streak, level, xp };
  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked   = ACHIEVEMENTS.filter(a => !a.check(stats));
  const userColor = ["#6C63FF","#FF6B9D","#43E97B","#F7C948","#38B2FF"][(user?.name?.charCodeAt(0)||0) % 5];
  const TITLES = ["Newcomer","Curious Mind","Eager Learner","Knowledge Seeker","Study Warrior","Academic","Scholar","Expert","Master","Legend"];
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)];

  const nameChanged = nameInput.trim() !== "" && nameInput.trim() !== user?.name;

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return toast.error("Name cannot be empty");
    if (trimmed === user?.name) return;
    setSavingName(true);
    try {
      await updateProfile({ name: trimmed });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
      setNameInput(user?.name || ""); // revert on failure
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.type)) {
      return toast.error("Please choose a JPG, PNG, WEBP, or GIF image");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image must be under 5MB");
    }

    // Instant local preview while uploading
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);

    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload image");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(previewUrl);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await removeAvatar();
      setAvatarPreview(null);
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error("Failed to remove picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = avatarPreview || user?.avatar_url || null;

  return (
    <div className="page" style={{ paddingTop:32, maxWidth:820 }}>
      {/* Hero */}
      <div className="card" style={{ padding:0, overflow:"hidden", marginBottom:22 }}>
        <div style={{ height:90, background:`linear-gradient(135deg,${userColor}44,${userColor}22)` }}/>
        <div style={{ padding:"0 26px 26px", marginTop:-38 }}>
          <div className="flex-between" style={{ flexWrap:"wrap", gap:12, alignItems:"flex-end" }}>
            {/* Avatar with upload overlay */}
            <div className="avatar-wrap" style={{ position:"relative" }}>
              <div
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                style={{
                  width:76, height:76, borderRadius:18, overflow:"hidden",
                  background: avatarSrc ? `url(${avatarSrc}) center/cover` : `linear-gradient(135deg,${userColor},${userColor}bb)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.8rem", fontWeight:800, color:"white",
                  border:"3px solid var(--bg-card)", cursor:"pointer", position:"relative",
                }}>
                {!avatarSrc && user?.name?.charAt(0).toUpperCase()}
                {/* Hover overlay */}
                <div className="avatar-overlay" style={{
                  position:"absolute", inset:0, background:"rgba(0,0,0,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  opacity:0, transition:"opacity 0.2s", borderRadius:18,
                }}>
                  {uploadingAvatar ? <Loader size={20} color="white" className="animate-spin"/> : <Camera size={20} color="white"/>}
                </div>
              </div>
              <div style={{ position:"absolute", bottom:-4, right:-4, background:"var(--accent-4)", borderRadius:7, padding:"2px 7px", fontSize:"0.68rem", fontWeight:800, color:"#000", border:"2px solid var(--bg-card)" }}>{level}</div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarFile} style={{ display:"none" }}/>
            </div>

            {avatarSrc && (
              <button onClick={handleRemoveAvatar} disabled={uploadingAvatar} className="btn btn-secondary btn-sm" style={{ gap:6 }}>
                <Trash2 size={13}/> Remove Photo
              </button>
            )}
          </div>

          <div style={{ marginTop:12 }}>
            <h2 style={{ fontWeight:800, fontSize:"1.25rem", marginBottom:2 }}>{user?.name}</h2>
            <div style={{ color:userColor, fontWeight:700, fontSize:"0.83rem", marginBottom:3 }}>{title}</div>
            <div style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>{user?.email || "No email (social login)"}</div>
          </div>

          <div style={{ marginTop:16, maxWidth:400 }}>
            <div className="flex-between" style={{ marginBottom:5 }}>
              <span style={{ fontSize:"0.76rem", color:"var(--text-muted)", fontWeight:600 }}>
                <Zap size={10} style={{ display:"inline", verticalAlign:"middle" }}/> Level {level}
              </span>
              <span style={{ fontSize:"0.76rem", color:"var(--text-muted)" }}>{xpPct}/100 XP</span>
            </div>
            <div className="progress-bar" style={{ height:7 }}><div className="progress-fill" style={{ width:`${xpPct}%` }}/></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:22 }}>
        {["overview","achievements","settings"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)} style={{ textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:13 }}>
            {[
              { icon:Zap,        color:"var(--accent-4)", label:"Total XP",    val:`${xp}` },
              { icon:TrendingUp, color:"var(--accent)",   label:"Level",       val:`${level}` },
              { icon:Flame,      color:"#FF6363",          label:"Streak",      val:`${streak} 🔥` },
              { icon:FileText,   color:"var(--accent-5)", label:"Notes",       val:`${stats.notes}` },
              { icon:Layers,     color:"var(--accent-2)", label:"Flashcards",  val:`${stats.flashcards}` },
              { icon:Award,      color:"var(--accent-3)", label:"Badges",      val:`${unlocked.length}` },
            ].map(({ icon:Icon, color, label, val }) => (
              <div key={label} className="card" style={{ textAlign:"center", padding:"16px 10px" }}>
                <Icon size={20} color={color} style={{ margin:"0 auto 7px" }}/>
                <div style={{ fontWeight:800, fontSize:"1.2rem", color }}>{val}</div>
                <div style={{ color:"var(--text-muted)", fontSize:"0.73rem", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          {streak > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:"rgba(255,99,99,0.06)", border:"1px solid rgba(255,99,99,0.15)", borderRadius:"var(--radius)" }}>
              <Flame size={18} color="#FF6363"/>
              <span style={{ fontSize:"0.85rem", color:"var(--text-secondary)" }}>
                You're on a <strong style={{ color:"#FF6363" }}>{streak}-day streak</strong>! Log in tomorrow to keep it going.
              </span>
            </div>
          )}
          {unlocked.length > 0 && (
            <div>
              <h3 style={{ fontWeight:700, marginBottom:12, fontSize:"0.92rem" }}>🏆 Unlocked Achievements</h3>
              <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
                {unlocked.map(a => (
                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 13px", background:"rgba(67,233,123,0.07)", border:"1px solid rgba(67,233,123,0.2)", borderRadius:99 }}>
                    <span style={{ fontSize:"1rem" }}>{a.icon}</span>
                    <span style={{ fontWeight:700, fontSize:"0.8rem", color:"var(--accent-3)" }}>{a.label}</span>
                    <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>+{a.xp}xp</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {tab === "achievements" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {unlocked.length > 0 && (
            <div>
              <h3 style={{ fontWeight:700, marginBottom:12, color:"var(--accent-3)" }}>✅ Unlocked ({unlocked.length})</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:11 }}>
                {unlocked.map(a => (
                  <div key={a.id} className="card" style={{ display:"flex", gap:13, alignItems:"center", border:"1px solid rgba(67,233,123,0.22)", background:"rgba(67,233,123,0.04)" }}>
                    <span style={{ fontSize:"1.8rem" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, color:"var(--accent-3)", fontSize:"0.88rem" }}>{a.label}</div>
                      <div style={{ fontSize:"0.76rem", color:"var(--text-muted)" }}>{a.desc}</div>
                      <div style={{ fontSize:"0.7rem", color:"var(--accent-4)", marginTop:3 }}>+{a.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {locked.length > 0 && (
            <div>
              <h3 style={{ fontWeight:700, marginBottom:12, color:"var(--text-muted)" }}>🔒 Locked ({locked.length})</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:11 }}>
                {locked.map(a => (
                  <div key={a.id} className="card" style={{ display:"flex", gap:13, alignItems:"center", opacity:0.45 }}>
                    <span style={{ fontSize:"1.8rem" }}>{a.icon}</span>
                    <div><div style={{ fontWeight:700, fontSize:"0.88rem" }}>{a.label}</div><div style={{ fontSize:"0.76rem", color:"var(--text-muted)" }}>{a.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:15, maxWidth:500 }}>
          {/* Account / name */}
          <div className="card" style={{ padding:20 }}>
            <h3 style={{ fontWeight:700, marginBottom:14, fontSize:"0.93rem", display:"flex", alignItems:"center", gap:8 }}>
              <KeyRound size={15} color="var(--accent-2)"/> Account
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              <div>
                <label className="label">Profile Picture</label>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div onClick={() => fileInputRef.current?.click()} style={{
                    width:48, height:48, borderRadius:12, overflow:"hidden", cursor:"pointer",
                    background: avatarSrc ? `url(${avatarSrc}) center/cover` : `linear-gradient(135deg,${userColor},${userColor}bb)`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"white", flexShrink:0,
                  }}>
                    {!avatarSrc && user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="btn btn-secondary btn-sm" style={{ gap:6 }}>
                    {uploadingAvatar ? <Loader size={13} className="animate-spin"/> : <Camera size={13}/>} Change Photo
                  </button>
                  {avatarSrc && (
                    <button onClick={handleRemoveAvatar} disabled={uploadingAvatar} className="btn btn-secondary btn-sm" style={{ gap:6, color:"#FF6363" }}>
                      <X size={13}/> Remove
                    </button>
                  )}
                </div>
                <p style={{ color:"var(--text-muted)", fontSize:"0.74rem", marginTop:6 }}>JPG, PNG, WEBP, or GIF — max 5MB</p>
              </div>

              <div>
                <label className="label">Display Name</label>
                <div style={{ display:"flex", gap:8 }}>
                  <input className="input" value={nameInput} onChange={e => setNameInput(e.target.value)} maxLength={60} onKeyDown={e => e.key === "Enter" && saveName()}/>
                  <button onClick={saveName} disabled={savingName || !nameChanged} className="btn btn-primary btn-sm" style={{ flexShrink:0, gap:6 }}>
                    {savingName ? <Loader size={13} className="animate-spin"/> : <Check size={13}/>} Save
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div style={{ position:"relative" }}>
                  <input className="input" value={user?.email || "No email (social login only)"} disabled style={{ opacity:0.55, paddingRight: user?.email ? 80 : undefined }}/>
                  {user?.email && (
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:"0.68rem", color:"var(--accent-3)", fontWeight:700, display:"flex", alignItems:"center", gap:3 }}>
                      <ShieldCheck size={11}/> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Connected accounts */}
          <div className="card" style={{ padding:20 }}>
            <h3 style={{ fontWeight:700, marginBottom:6, fontSize:"0.93rem", display:"flex", alignItems:"center", gap:8 }}>
              <Link2 size={15} color="var(--accent-5)"/> Connected Accounts
            </h3>
            <p style={{ color:"var(--text-muted)", fontSize:"0.78rem", marginBottom:14, lineHeight:1.5 }}>Sign in faster with your social accounts.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {PROVIDERS.map(({ key, label, Icon, color, bg, border }) => {
                const connected = !!user?.oauth?.[key];
                const configured = providers[key];
                return (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:13, padding:"11px 15px", background:connected?bg:"var(--bg-secondary)", border:`1.5px solid ${connected?border:"var(--border-light)"}`, borderRadius:"var(--radius-sm)" }}>
                    <div style={{ width:34, height:34, background:connected?bg:"rgba(255,255,255,0.04)", border:`1px solid ${connected?border:"var(--border-light)"}`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon/></div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:"0.86rem", color:connected?color:"var(--text-primary)" }}>{label}</div>
                      <div style={{ fontSize:"0.73rem", color:"var(--text-muted)" }}>{!configured?"Not configured":connected?"✓ Connected":"Not connected"}</div>
                    </div>
                    {configured && (connected
                      ? <span style={{ fontSize:"0.72rem", color:"var(--accent-3)", fontWeight:700, background:"rgba(67,233,123,0.1)", padding:"3px 10px", borderRadius:99, border:"1px solid rgba(67,233,123,0.2)", display:"flex", alignItems:"center", gap:4 }}><Check size={11}/>Connected</span>
                      : <button onClick={() => { window.location.href = `/api/auth/${key}`; }} style={{ fontSize:"0.76rem", fontWeight:700, color, background:bg, border:`1px solid ${border}`, padding:"5px 13px", borderRadius:99, cursor:"pointer", fontFamily:"var(--font)" }}>Connect</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ padding:20, border:"1px solid rgba(255,99,99,0.15)", background:"rgba(255,99,99,0.02)" }}>
            <h3 style={{ fontWeight:700, marginBottom:12, fontSize:"0.93rem", color:"#FF6363" }}>Danger Zone</h3>
            <button onClick={() => { if (confirm("Sign out?")) logout(); }} className="btn btn-danger w-full">Sign Out</button>
          </div>
        </div>
      )}

      <style>{`
        .avatar-wrap:hover .avatar-overlay { opacity: 1; }
      `}</style>
    </div>
  );
}
