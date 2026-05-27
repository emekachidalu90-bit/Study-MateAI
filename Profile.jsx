import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { FileText, Layers, Gamepad2, MessageCircle, Plus, Clock, Zap, TrendingUp, BookOpen, ChevronRight, Star, Sparkles, Calendar } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/notes").then(r => setNotes(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const xpPct = (user?.xp || 0) % 100;

  const stats = [
    { label:"Notes",   value:notes.length,        icon:FileText,   color:"var(--accent)"   },
    { label:"Level",   value:`Lvl ${user?.level||1}`, icon:TrendingUp, color:"var(--accent-2)" },
    { label:"XP",      value:`${user?.xp||0}`,    icon:Zap,        color:"var(--accent-4)" },
    { label:"Streak",  value:`${user?.streak||0}🔥`, icon:Star,     color:"var(--accent-3)" },
  ];
  const actions = [
    { to:"/notes",      icon:Plus,          label:"New Note",    color:"var(--accent)",   desc:"Upload or write" },
    { to:"/flashcards", icon:Layers,        label:"Flashcards",  color:"var(--accent-2)", desc:"Review cards"    },
    { to:"/quiz",       icon:Gamepad2,      label:"Quiz Arena",  color:"var(--accent-3)", desc:"Solo or live"    },
    { to:"/tutor",      icon:MessageCircle, label:"AI Tutor",    color:"var(--accent-5)", desc:"Ask anything"    },
  ];

  return (
    <div className="page" style={{ paddingTop:32 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:"1.8rem",fontWeight:800,marginBottom:4 }}>
          {greeting}, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{ color:"var(--text-secondary)" }}>Ready to learn something amazing today?</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        {stats.map(({ label,value,icon:Icon,color }) => (
          <div key={label} className="card" style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:42,height:42,background:`${color}18`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <div style={{ fontSize:"1.25rem",fontWeight:800,color }}>{value}</div>
              <div style={{ fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div className="card" style={{ marginBottom:24,padding:"18px 22px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <span style={{ fontWeight:700,display:"flex",alignItems:"center",gap:7 }}><Zap size={16} color="var(--accent-4)"/>Level {user?.level||1} Progress</span>
          <span style={{ color:"var(--text-muted)",fontSize:"0.82rem" }}>{xpPct}/100 XP</span>
        </div>
        <div className="progress-bar" style={{ height:8 }}><div className="progress-fill" style={{ width:`${xpPct}%` }}/></div>
        <div style={{ fontSize:"0.75rem",color:"var(--text-muted)",marginTop:5 }}>{100-xpPct} XP to Level {(user?.level||1)+1}</div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontWeight:700,marginBottom:14,fontSize:"0.95rem" }}>Quick Actions</h2>
        <div className="grid-4">
          {actions.map(({ to,icon:Icon,label,color,desc }) => (
            <Link key={to} to={to} className="card hover-lift" style={{ textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:10,textAlign:"center",cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=color}
              onMouseLeave={e => e.currentTarget.style.borderColor=""}>
              <div style={{ width:48,height:48,background:`${color}18`,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon size={24} color={color}/></div>
              <div><div style={{ fontWeight:700,marginBottom:2 }}>{label}</div><div style={{ color:"var(--text-muted)",fontSize:"0.75rem" }}>{desc}</div></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent notes */}
      <div style={{ marginBottom:28 }}>
        <div className="flex-between" style={{ marginBottom:14 }}>
          <h2 style={{ fontWeight:700,fontSize:"0.95rem" }}>Recent Notes</h2>
          <Link to="/notes" style={{ color:"var(--accent)",fontSize:"0.83rem",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>View all <ChevronRight size={13}/></Link>
        </div>
        {loading ? (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:100,borderRadius:16 }}/>)}
          </div>
        ) : notes.length === 0 ? (
          <div className="card" style={{ textAlign:"center",padding:48 }}>
            <BookOpen size={38} color="var(--text-muted)" style={{ margin:"0 auto 12px" }}/>
            <div style={{ fontWeight:600,marginBottom:8,color:"var(--text-secondary)" }}>No notes yet</div>
            <p style={{ color:"var(--text-muted)",fontSize:"0.85rem",marginBottom:18 }}>Upload a document or write your first note</p>
            <Link to="/notes" className="btn btn-primary btn-sm"><Plus size={14}/> Create Note</Link>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
            {notes.slice(0,4).map(n => (
              <Link key={n.id} to={`/notes/${n.id}`} className="card hover-lift" style={{ textDecoration:"none" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor=""}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ width:34,height:34,background:"rgba(108,99,255,0.1)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}><FileText size={17} color="var(--accent)"/></div>
                  <span style={{ fontSize:"0.7rem",color:"var(--text-muted)",display:"flex",alignItems:"center",gap:3 }}><Clock size={10}/>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight:700,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.9rem" }}>{n.title}</div>
                <div style={{ color:"var(--text-muted)",fontSize:"0.78rem",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{n.content?.slice(0,100)||"No preview"}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="card" style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.08),rgba(255,107,157,0.05))",border:"1px solid rgba(108,99,255,0.2)" }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
          <div style={{ width:38,height:38,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Sparkles size={18} color="white"/></div>
          <div>
            <div style={{ fontWeight:700,marginBottom:4 }}>💡 Study Tip</div>
            <p style={{ color:"var(--text-secondary)",fontSize:"0.86rem",lineHeight:1.6 }}>
              Use the <strong style={{ color:"var(--text-primary)" }}>Pomodoro Technique</strong> — study 25 min, break 5 min, repeat. Try our <Link to="/study-plan" style={{ color:"var(--accent)",textDecoration:"none" }}>Study Plan generator</Link> to build your perfect schedule!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
