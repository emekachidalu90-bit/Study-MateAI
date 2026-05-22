import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Zap, Users, Brain, FileText, Trophy, ChevronRight, Sparkles } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GoogleIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
const GitHubIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const DiscordIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 21.19a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;

const FEATURES = [
  { icon:FileText, color:"var(--accent)",   title:"Smart Notes",      desc:"Upload PDF, PPTX, DOCX, Excel, TXT — AI extracts and summarizes instantly." },
  { icon:Brain,    color:"var(--accent-2)", title:"AI Flashcards",    desc:"Auto-generate flip-card study sets from any document with one click." },
  { icon:Zap,      color:"var(--accent-4)", title:"Solo Quiz",        desc:"Test yourself with AI-generated quizzes from your notes. Track progress." },
  { icon:Users,    color:"var(--accent-3)", title:"Multiplayer Quiz", desc:"Host live quiz battles — just like Kahoot but powered by your own notes." },
  { icon:Sparkles, color:"var(--accent-5)", title:"AI Tutor",         desc:"Chat with your personal AI tutor 24/7. Ask anything, get clear explanations." },
  { icon:Trophy,   color:"var(--accent-2)", title:"Leaderboard",      desc:"Earn XP, level up, unlock achievements, and compete globally." },
];

const SOCIAL_PROVIDERS = [
  { key:"google",  Icon:GoogleIcon,  label:"Google",  bg:"white",   color:"#333",  border:"#dadce0" },
  { key:"github",  Icon:GitHubIcon,  label:"GitHub",  bg:"#24292F", color:"white", border:"#444d56" },
  { key:"discord", Icon:DiscordIcon, label:"Discord", bg:"#5865F2", color:"white", border:"#5865F2" },
];

export default function Landing() {
  const [providers, setProviders] = useState({ google:false, github:false, discord:false });
  const [loadingProvider, setLoadingProvider] = useState(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    api.get("/auth/providers").then(r => setProviders(r.data)).catch(() => {});
  }, []);

  const handleOAuth = (key) => {
    if (loadingProvider) return;
    setLoadingProvider(key);
    const w = 520, h = 620;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(
      `/api/auth/${key}`,
      `oauth_${key}`,
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );
    if (!popup) {
      setLoadingProvider(null);
      window.location.href = `/api/auth/${key}`;
      return;
    }
    const handler = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "OAUTH_SUCCESS") {
        window.removeEventListener("message", handler);
        clearInterval(poll);
        setLoadingProvider(null);
        try {
          localStorage.setItem("sm_token", event.data.token);
          api.defaults.headers.common["Authorization"] = `Bearer ${event.data.token}`;
          const user = await refreshUser();
          if (user) {
            toast.success(`Welcome, ${user.name?.split(" ")[0]}! 🎉`);
            navigate("/dashboard");
          }
        } catch {
          toast.error("Failed to load account.");
        }
      } else if (event.data?.type === "OAUTH_ERROR") {
        window.removeEventListener("message", handler);
        clearInterval(poll);
        setLoadingProvider(null);
        toast.error(event.data.error || "Sign-in failed.");
      }
    };
    window.addEventListener("message", handler);
    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handler);
        setLoadingProvider(null);
      }
    }, 500);
  };

  const social = SOCIAL_PROVIDERS.filter(s => providers[s.key]);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-primary)", overflowX:"hidden" }}>
      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px", borderBottom:"1px solid var(--border-light)", position:"sticky", top:0, background:"rgba(15,15,26,0.92)", backdropFilter:"blur(20px)", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <BookOpen size={18} color="white"/>
          </div>
          <span style={{ fontWeight:800, fontSize:"1.15rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span></span>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started <ChevronRight size={14}/></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:"center", padding:"100px 24px 80px", position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle,rgba(108,99,255,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div className="animate-fade">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:99, padding:"6px 16px", marginBottom:24 }}>
            <Sparkles size={13} color="var(--accent)"/>
            <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--accent)" }}>AI-Powered Study Platform</span>
          </div>
          <h1 style={{ fontSize:"clamp(2.2rem,6vw,4rem)", fontWeight:800, lineHeight:1.15, marginBottom:20, maxWidth:700, margin:"0 auto 20px" }}>
            Study Smarter with<br/><span className="gradient-text">AI That Gets You</span>
          </h1>
          <p style={{ fontSize:"1.1rem", color:"var(--text-secondary)", maxWidth:520, margin:"0 auto 40px", lineHeight:1.7 }}>
            Upload your notes, generate flashcards, quiz yourself or battle friends live. Your personal AI tutor never sleeps.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom: social.length ? 28 : 0 }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start Studying Free <ChevronRight size={18}/></Link>
            <Link to="/quiz/join" className="btn btn-secondary btn-lg"><Users size={18}/> Join a Quiz</Link>
          </div>

          {social.length > 0 && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:14 }}>
                <div style={{ height:1, width:60, background:"var(--border-light)" }}/>
                <span style={{ color:"var(--text-muted)", fontSize:"0.73rem", fontWeight:600 }}>or sign in with</span>
                <div style={{ height:1, width:60, background:"var(--border-light)" }}/>
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {social.map(({ key, Icon, label, bg, color, border }) => (
                  <button key={key} onClick={() => handleOAuth(key)} disabled={!!loadingProvider}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:bg, color, border:`1.5px solid ${border}`, borderRadius:"var(--radius-sm)", fontFamily:"var(--font)", fontSize:"0.85rem", fontWeight:600, cursor:loadingProvider?"not-allowed":"pointer", transition:"all 0.18s", boxShadow:"0 2px 8px rgba(0,0,0,0.2)", opacity:loadingProvider&&loadingProvider!==key?0.6:1 }}
                    onMouseEnter={e => { if (!loadingProvider) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.3)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"; }}>
                    <Icon/>{loadingProvider===key?"Signing in…":label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"0 24px 80px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:800, marginBottom:8 }}>Everything you need to ace exams</h2>
          <p style={{ textAlign:"center", color:"var(--text-secondary)", marginBottom:48 }}>One platform for all your study needs</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {FEATURES.map(({ icon:Icon, color, title, desc }) => (
              <div key={title} className="card hover-lift" style={{ padding:24 }}>
                <div style={{ width:46, height:46, background:`${color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Icon size={22} color={color}/>
                </div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>{title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"var(--bg-secondary)", borderTop:"1px solid var(--border-light)" }}>
        <h2 style={{ fontSize:"2rem", fontWeight:800, marginBottom:16 }}>Ready to study smarter?</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:32 }}>Free forever · No credit card needed · PWA installable</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account <ChevronRight size={18}/></Link>
      </section>

      <footer style={{ padding:"20px", textAlign:"center", color:"var(--text-muted)", fontSize:"0.78rem", borderTop:"1px solid var(--border-light)" }}>
        © {new Date().getFullYear()} StudyMate AI
      </footer>
    </div>
  );
}
