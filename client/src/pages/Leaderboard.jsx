import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Trophy, Zap, Flame, TrendingUp } from "lucide-react";

const DEMO = [
  { name:"Sophia K.", xp:2840, level:29, streak:14, color:"#6C63FF" },
  { name:"James M.",  xp:2210, level:23, streak:9,  color:"#FF6B9D" },
  { name:"Aisha N.",  xp:1980, level:20, streak:21, color:"#43E97B" },
  { name:"Lucas P.",  xp:1650, level:17, streak:6,  color:"#F7C948" },
  { name:"Emma T.",   xp:1430, level:15, streak:12, color:"#38B2FF" },
  { name:"Noah R.",   xp:1200, level:13, streak:4,  color:"#A78BFA" },
  { name:"Mia C.",    xp:980,  level:10, streak:7,  color:"#FF6363" },
  { name:"Ethan B.",  xp:760,  level:8,  streak:2,  color:"#34D399" },
];

const RANKS = { 0:{ emoji:"🥇", color:"#F7C948", glow:"rgba(247,201,72,0.25)" }, 1:{ emoji:"🥈", color:"#C0C0C0", glow:"rgba(192,192,192,0.2)" }, 2:{ emoji:"🥉", color:"#CD7F32", glow:"rgba(205,127,50,0.2)" } };

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("xp");
  const [notes, setNotes] = useState([]);
  useEffect(() => { api.get("/notes").then(r => setNotes(r.data)).catch(() => {}); }, []);

  const me = { name:user?.name||"You", xp:user?.xp||0, level:user?.level||1, streak:user?.streak||0, color:"var(--accent)", isMe:true };
  const all = [...DEMO, me];

  const sorted = {
    xp:     [...all].sort((a,b) => b.xp - a.xp),
    streak: [...all].sort((a,b) => b.streak - a.streak),
    level:  [...all].sort((a,b) => b.level - a.level),
  };

  const players = sorted[tab];
  const myRank  = players.findIndex(p => p.isMe) + 1;

  const val = (p) => tab==="xp" ? `${p.xp} XP` : tab==="streak" ? `${p.streak}🔥` : `Lvl ${p.level}`;

  return (
    <div className="page" style={{ paddingTop:32, maxWidth:680 }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:60,height:60,background:"linear-gradient(135deg,var(--accent-4),var(--accent-2))",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
          <Trophy size={30} color="white"/>
        </div>
        <h1 style={{ fontWeight:800,fontSize:"1.7rem",marginBottom:6 }}>Leaderboard</h1>
        <p style={{ color:"var(--text-secondary)" }}>Study more, earn XP, climb the ranks</p>
      </div>

      {/* My rank */}
      <div style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.12),rgba(255,107,157,0.08))",border:"1px solid rgba(108,99,255,0.25)",borderRadius:"var(--radius)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:42,height:42,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"1.05rem",color:"white" }}>
            {me.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:700 }}>{me.name} <span style={{ color:"var(--accent)",fontSize:"0.78rem" }}>(You)</span></div>
            <div style={{ color:"var(--text-muted)",fontSize:"0.78rem" }}>Rank #{myRank} globally</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:18 }}>
          {[["var(--accent-4)",me.xp,"XP"],["var(--accent)",`Lvl ${me.level}`,"Level"],["#FF6363",`${me.streak}🔥`,"Streak"]].map(([c,v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontWeight:800,color:c,fontSize:"1.05rem" }}>{v}</div>
              <div style={{ fontSize:"0.7rem",color:"var(--text-muted)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:20 }}>
        <button className={`tab ${tab==="xp"?"active":""}`} onClick={()=>setTab("xp")}><Zap size={13}/> XP</button>
        <button className={`tab ${tab==="streak"?"active":""}`} onClick={()=>setTab("streak")}><Flame size={13}/> Streaks</button>
        <button className={`tab ${tab==="level"?"active":""}`} onClick={()=>setTab("level")}><TrendingUp size={13}/> Levels</button>
      </div>

      {/* Top 3 podium */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.1fr 1fr",gap:12,marginBottom:22,alignItems:"flex-end" }}>
        {[players[1],players[0],players[2]].map((p,i) => {
          if (!p) return <div key={i}/>;
          const rank = [1,0,2][i];
          const badge = RANKS[rank];
          const heights = ["110px","140px","95px"];
          return (
            <div key={p.name} style={{ background:`${badge.color}10`,border:`2px solid ${badge.color}30`,borderRadius:"var(--radius)",padding:"14px 10px",textAlign:"center",height:heights[i],display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:`0 0 20px ${badge.glow}` }}>
              <span style={{ fontSize:"1.4rem" }}>{badge.emoji}</span>
              <div style={{ width:36,height:36,background:p.color,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",fontSize:"0.95rem" }}>{p.name.charAt(0).toUpperCase()}</div>
              <div style={{ fontWeight:700,fontSize:"0.78rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%",padding:"0 4px" }}>{p.name}</div>
              <div style={{ fontWeight:800,color:badge.color,fontSize:"0.82rem" }}>{val(p)}</div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {players.map((p,i) => {
          const badge = RANKS[i];
          return (
            <div key={`${p.name}-${i}`} style={{ display:"flex",alignItems:"center",gap:13,padding:"13px 17px",background:p.isMe?"rgba(108,99,255,0.07)":"var(--bg-card)",border:`1px solid ${p.isMe?"rgba(108,99,255,0.25)":badge?`${badge.color}25`:"var(--border-light)"}`,borderRadius:"var(--radius)",transition:"transform 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform=""}>
              <div style={{ width:30,textAlign:"center",fontSize:badge?"1.1rem":"0.88rem",fontWeight:800,color:badge?badge.color:"var(--text-muted)",flexShrink:0 }}>{badge?badge.emoji:`#${i+1}`}</div>
              <div style={{ width:38,height:38,background:p.color,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white",flexShrink:0 }}>{p.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.9rem" }}>
                  {p.name} {p.isMe&&<span style={{ color:"var(--accent)",fontSize:"0.73rem" }}>• You</span>}
                </div>
                <div style={{ fontSize:"0.72rem",color:"var(--text-muted)" }}>Level {p.level}</div>
              </div>
              <div style={{ fontWeight:800,color:badge?badge.color:"var(--text-primary)",fontSize:"0.92rem",flexShrink:0 }}>{val(p)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:"center",marginTop:22,color:"var(--text-muted)",fontSize:"0.78rem" }}>
        ✨ Study daily to climb the leaderboard — every note and quiz earns XP!
      </div>
    </div>
  );
}
