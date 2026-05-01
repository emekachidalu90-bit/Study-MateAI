import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Zap, Users, Brain, FileText, Trophy, Star, ChevronRight, Sparkles } from "lucide-react";
import api from "../utils/api";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 21.19a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

const features = [
  { icon: FileText, color: "var(--accent)", title: "Smart Notes", desc: "Upload PDFs, PPTX, DOCX, or type notes. AI summarizes and organizes everything instantly." },
  { icon: Brain, color: "var(--accent-2)", title: "AI Flashcards", desc: "Automatically generate flashcards from any document. Study smarter with spaced repetition." },
  { icon: Zap, color: "var(--accent-4)", title: "Solo Quiz", desc: "Test yourself with AI-generated quizzes from your notes. Track your progress over time." },
  { icon: Users, color: "var(--accent-3)", title: "Multiplayer Quiz", desc: "Host live quiz battles with friends — just like Kahoot but powered by your own notes." },
  { icon: Sparkles, color: "var(--accent-5)", title: "AI Tutor", desc: "Chat with an AI tutor about any topic. Get explanations, examples, and answers 24/7." },
  { icon: Trophy, color: "var(--accent-2)", title: "Leaderboards", desc: "Earn XP, level up, and compete with other students globally." },
];

export default function Landing() {
  const [providers, setProviders] = useState({ google: false, github: false, discord: false });
  useEffect(() => { api.get("/auth/providers").then(r => setProviders(r.data)).catch(() => {}); }, []);

  const socialButtons = [
    { key:"google",  Icon:GoogleIcon,  label:"Google",  bg:"white",   color:"#333",  border:"#dadce0" },
    { key:"github",  Icon:GitHubIcon,  label:"GitHub",  bg:"#24292F", color:"white", border:"#444d56" },
    { key:"discord", Icon:DiscordIcon, label:"Discord", bg:"#5865F2", color:"white", border:"#5865F2" },
  ].filter(b => providers[b.key]);
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-primary)", overflowX:"hidden" }}>
      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px", borderBottom:"1px solid var(--border-light)", position:"sticky", top:0, background:"rgba(15,15,26,0.9)", backdropFilter:"blur(20px)", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <BookOpen size={20} color="white" />
          </div>
          <span style={{ fontWeight:800, fontSize:"1.2rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span></span>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started <ChevronRight size={16} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:"center", padding:"100px 24px 80px", position:"relative" }}>
        {/* Background glow */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div className="animate-fade">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:99, padding:"6px 16px", marginBottom:24 }}>
            <Sparkles size={14} color="var(--accent)" />
            <span style={{ fontSize:"0.82rem", fontWeight:600, color:"var(--accent)" }}>AI-Powered Study Platform</span>
          </div>

          <h1 style={{ fontSize:"clamp(2.2rem, 6vw, 4rem)", fontWeight:800, lineHeight:1.15, marginBottom:20, maxWidth:700, margin:"0 auto 20px" }}>
            Study Smarter with<br />
            <span className="gradient-text">AI That Gets You</span>
          </h1>
          <p style={{ fontSize:"1.1rem", color:"var(--text-secondary)", maxWidth:520, margin:"0 auto 40px", lineHeight:1.7 }}>
            Upload your notes, generate flashcards, quiz yourself solo or battle friends in real-time. Your personal AI tutor is always ready.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Studying Free <ChevronRight size={18} />
            </Link>
            <Link to="/quiz/join" className="btn btn-secondary btn-lg">
              <Users size={18} /> Join a Quiz
            </Link>
          </div>

          {/* Social login quick-buttons (only when configured) */}
          {socialButtons.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:12 }}>
                <div style={{ height:1, width:60, background:"var(--border-light)" }} />
                <span style={{ color:"var(--text-muted)", fontSize:"0.75rem", fontWeight:600 }}>or sign in instantly with</span>
                <div style={{ height:1, width:60, background:"var(--border-light)" }} />
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {socialButtons.map(({ key, Icon, label, bg, color, border }) => (
                  <button key={key} onClick={() => window.location.href = `/api/auth/${key}`}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:bg, color, border:`1.5px solid ${border}`, borderRadius:"var(--radius-sm)", fontFamily:"var(--font)", fontSize:"0.85rem", fontWeight:600, cursor:"pointer", transition:"all 0.18s", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"; }}>
                    <Icon /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p style={{ color:"var(--text-muted)", fontSize:"0.82rem", marginTop:16 }}>Free forever · No credit card required</p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding:"0 24px 64px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[["10K+","Students"],["50K+","Quizzes Played"],["1M+","Flashcards Created"]].map(([n,l]) => (
            <div key={l} className="card" style={{ textAlign:"center", padding:"24px 16px" }}>
              <div style={{ fontSize:"2rem", fontWeight:800, color:"var(--accent)", marginBottom:4 }}>{n}</div>
              <div style={{ color:"var(--text-secondary)", fontSize:"0.85rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"0 24px 80px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:800, marginBottom:8 }}>Everything you need to ace your exams</h2>
          <p style={{ textAlign:"center", color:"var(--text-secondary)", marginBottom:48 }}>One platform for all your study needs</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card" style={{ padding:24 }}>
                <div style={{ width:48, height:48, background:`${color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>{title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", lineHeight:1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"var(--bg-secondary)", borderTop:"1px solid var(--border-light)" }}>
        <h2 style={{ fontSize:"2rem", fontWeight:800, marginBottom:16 }}>Ready to transform how you study?</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:32, fontSize:"1rem" }}>Join thousands of students already using StudyMate AI</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ChevronRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontSize:"0.8rem", borderTop:"1px solid var(--border-light)" }}>
        © {new Date().getFullYear()} StudyMate AI · Built with ❤️ for students everywhere
      </footer>
    </div>
  );
}
