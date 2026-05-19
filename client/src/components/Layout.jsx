import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FileText, Layers, Gamepad2, MessageCircle, Calendar, Trophy, LogOut, Menu, X, BookOpen, Zap, Star } from "lucide-react";

const NAV = [
  { to:"/dashboard",   icon:LayoutDashboard, label:"Dashboard"   },
  { to:"/notes",       icon:FileText,        label:"My Notes"    },
  { to:"/flashcards",  icon:Layers,          label:"Flashcards"  },
  { to:"/quiz",        icon:Gamepad2,        label:"Quiz Arena"  },
  { to:"/tutor",       icon:MessageCircle,   label:"AI Tutor"    },
  { to:"/study-plan",  icon:Calendar,        label:"Study Plan"  },
  { to:"/leaderboard", icon:Trophy,          label:"Leaderboard" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const xpPct = (user?.xp || 0) % 100;

  return (
    <div className="app-layout">
      {open && <div onClick={() => setOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:99,backdropFilter:"blur(4px)" }}/>}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid var(--border-light)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BookOpen size={18} color="white"/>
            </div>
            <span style={{ fontWeight:800,fontSize:"1.05rem" }}>Study<span className="text-accent">Mate</span></span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1,padding:"10px 8px",overflowY:"auto" }}>
          {NAV.map(({ to, icon:Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} style={({ isActive }) => ({
              display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,
              marginBottom:2,textDecoration:"none",fontWeight:600,fontSize:"0.87rem",
              transition:"all 0.15s",
              background: isActive ? "rgba(108,99,255,0.15)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            })}>
              <Icon size={17}/>{label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"10px 8px",borderTop:"1px solid var(--border-light)" }}>
          <div style={{ padding:"10px 12px",background:"var(--bg-primary)",borderRadius:10,marginBottom:8 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:"0.73rem",color:"var(--text-muted)",fontWeight:600 }}><Zap size={11} style={{ display:"inline",verticalAlign:"middle",color:"var(--accent-4)" }}/> Lvl {user?.level||1}</span>
              <span style={{ fontSize:"0.73rem",color:"var(--text-muted)" }}>{user?.xp||0} XP</span>
            </div>
            <div className="progress-bar" style={{ height:5 }}>
              <div className="progress-fill" style={{ width:`${xpPct}%` }}/>
            </div>
          </div>
          {(user?.streak||0)>0 && (
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 12px",marginBottom:6,background:"rgba(247,201,72,0.07)",borderRadius:8 }}>
              <Star size={13} color="var(--accent-4)"/>
              <span style={{ fontSize:"0.76rem",color:"var(--accent-4)",fontWeight:600 }}>{user.streak} day streak!</span>
            </div>
          )}
          <NavLink to="/profile" onClick={() => setOpen(false)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,textDecoration:"none",marginBottom:6,transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <div style={{ width:32,height:32,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.9rem",color:"white",flexShrink:0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:"0.83rem",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name}</div>
              <div style={{ fontSize:"0.7rem",color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.email}</div>
            </div>
          </NavLink>
          <button onClick={() => { logout(); navigate("/"); }} className="btn btn-secondary btn-sm w-full" style={{ justifyContent:"center" }}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        {/* Mobile topbar */}
        <div style={{ display:"none",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"var(--bg-secondary)",borderBottom:"1px solid var(--border-light)",position:"sticky",top:0,zIndex:50 }} id="topbar">
          <button onClick={() => setOpen(true)} className="btn btn-secondary btn-icon"><Menu size={19}/></button>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:26,height:26,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BookOpen size={14} color="white"/>
            </div>
            <span style={{ fontWeight:800 }}>Study<span className="text-accent">Mate</span></span>
          </div>
          <div style={{ width:38 }}/>
        </div>
        <style>{`@media(max-width:768px){#topbar{display:flex!important}}`}</style>
        <Outlet/>
      </div>
    </div>
  );
}
