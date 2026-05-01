import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Sparkles } from "lucide-react";

// ─── SVG brand icons ───
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 21.19a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

const SOCIAL_PROVIDERS = [
  { key: "google",  label: "Google",  Icon: GoogleIcon,  bg: "white",        color: "#444",      border: "#dadce0" },
  { key: "github",  label: "GitHub",  Icon: GitHubIcon,  bg: "#24292F",      color: "white",     border: "#24292F" },
  { key: "discord", label: "Discord", Icon: DiscordIcon, bg: "#5865F2",      color: "white",     border: "#5865F2" },
];

export default function Auth({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [providers, setProviders] = useState({ google: false, github: false, discord: false });
  const isLogin = mode === "login";

  // Fetch which OAuth providers are configured
  useEffect(() => {
    api.get("/auth/providers").then(r => setProviders(r.data)).catch(() => {});
    // Show error from OAuth redirect failure
    const err = searchParams.get("error");
    if (err) {
      const msgs = { google_failed: "Google sign-in failed.", github_failed: "GitHub sign-in failed.", discord_failed: "Discord sign-in failed." };
      toast.error(msgs[err] || "Social sign-in failed.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back! 👋");
      } else {
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        if (form.password.length < 6) { toast.error("Password must be 6+ characters"); return; }
        await register(form.name, form.email, form.password);
        toast.success("Account created! Let's study 🚀");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    // Redirect to backend OAuth flow
    window.location.href = `/api/auth/${provider}`;
  };

  const enabledProviders = SOCIAL_PROVIDERS.filter(p => providers[p.key]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--bg-primary)", position:"relative", overflow:"hidden" }}>
      {/* Ambient background blobs */}
      <div style={{ position:"fixed", top:"-20%", right:"-10%", width:500, height:500, background:"radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-20%", left:"-10%", width:400, height:400, background:"radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      {/* Left panel — hidden on mobile */}
      <div className="hide-mobile" style={{ width:"42%", minHeight:"100vh", background:"linear-gradient(145deg, rgba(108,99,255,0.12), rgba(255,107,157,0.06))", borderRight:"1px solid var(--border-light)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 56px", position:"relative" }}>
        <div style={{ marginBottom:48 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
            <div style={{ width:44, height:44, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={24} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:"1.3rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span> <span style={{ color:"var(--text-muted)", fontWeight:400, fontSize:"0.9rem" }}>AI</span></span>
          </div>

          <h2 style={{ fontSize:"2rem", fontWeight:800, lineHeight:1.25, marginBottom:16 }}>
            Your AI-powered<br />
            <span className="gradient-text">study companion</span>
          </h2>
          <p style={{ color:"var(--text-secondary)", lineHeight:1.7, fontSize:"0.95rem" }}>
            Upload notes, generate flashcards, quiz your friends live, and chat with an AI tutor — all in one place.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { emoji:"📄", text:"Upload any document — PDF, PPTX, DOCX, Excel, TXT" },
            { emoji:"🃏", text:"AI generates flashcards & summaries instantly" },
            { emoji:"🎮", text:"Host live multiplayer quizzes like Kahoot" },
            { emoji:"🤖", text:"Chat with your personal AI study tutor" },
            { emoji:"🏆", text:"Earn XP, level up, and climb the leaderboard" },
          ].map(({ emoji, text }) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid var(--border-light)" }}>
              <span style={{ fontSize:"1.2rem", flexShrink:0 }}>{emoji}</span>
              <span style={{ color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ marginTop:48, color:"var(--text-muted)", fontSize:"0.78rem" }}>
          Free forever · No credit card required · PWA installable
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ width:"100%", maxWidth:420 }} className="animate-fade">

          <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-secondary)", fontSize:"0.85rem", textDecoration:"none", marginBottom:32 }}>
            <ArrowLeft size={15} /> Back to home
          </Link>

          {/* Logo (mobile only) */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }} className="show-mobile-only">
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={20} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:"1.1rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span></span>
          </div>

          <h1 style={{ fontWeight:800, fontSize:"1.6rem", marginBottom:4 }}>
            {isLogin ? "Welcome back 👋" : "Create your account"}
          </h1>
          <p style={{ color:"var(--text-secondary)", marginBottom:28, fontSize:"0.9rem" }}>
            {isLogin ? "Sign in to continue your study streak" : "Join thousands of students studying smarter"}
          </p>

          {/* ── Social buttons ── */}
          {enabledProviders.length > 0 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {enabledProviders.map(({ key, label, Icon, bg, color, border }) => (
                  <button key={key} onClick={() => handleOAuth(key)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", padding:"11px 20px", background:bg, color, border:`1.5px solid ${border}`, borderRadius:"var(--radius-sm)", fontFamily:"var(--font)", fontSize:"0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.18s", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"; }}>
                    <Icon />
                    Continue with {label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:"var(--border-light)" }} />
                <span style={{ color:"var(--text-muted)", fontSize:"0.78rem", fontWeight:600, whiteSpace:"nowrap" }}>or continue with email</span>
                <div style={{ flex:1, height:1, background:"var(--border-light)" }} />
              </div>
            </>
          )}

          {/* ── Email/password form ── */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <div style={{ position:"relative" }}>
                  <User size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }} />
                  <input className="input" style={{ paddingLeft:40 }} type="text" placeholder="Your full name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div style={{ position:"relative" }}>
                <Mail size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }} />
                <input className="input" style={{ paddingLeft:40 }} type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }} />
                <input className="input" style={{ paddingLeft:40, paddingRight:44 }} type={showPass?"text":"password"}
                  placeholder={isLogin ? "Your password" : "Min. 6 characters"} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p=>!p)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex", padding:4 }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop:4 }} disabled={loading}>
              {loading
                ? <span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                : isLogin ? "Sign In →" : "Create Account 🎉"}
            </button>
          </form>

          <p style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:"0.88rem", marginTop:20 }}>
            {isLogin
              ? <>Don't have an account? <Link to="/register" style={{ color:"var(--accent)", fontWeight:700, textDecoration:"none" }}>Sign up free</Link></>
              : <>Already have an account? <Link to="/login" style={{ color:"var(--accent)", fontWeight:700, textDecoration:"none" }}>Sign in</Link></>}
          </p>

          <p style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.72rem", marginTop:16, lineHeight:1.5 }}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`.show-mobile-only { display: none; } @media (max-width:768px) { .show-mobile-only { display: flex !important; } }`}</style>
    </div>
  );
}
