import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { getSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Copy, Users, Zap, Send, Trophy, Home } from "lucide-react";

const OPT_COLORS = ["#FF6B9D","#6C63FF","#43E97B","#F7C948"];
const OPT_LETTERS = ["A","B","C","D"];

function RingTimer({ value, max }) {
  const r = 24, circ = 2*Math.PI*r, pct = value/max, offset = circ*(1-pct);
  const color = value<=5?"#FF6363":value<=10?"#F7C948":"var(--accent)";
  return (
    <div className="ring-timer">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle className="track" cx="28" cy="28" r={r}/>
        <circle className="fill" cx="28" cy="28" r={r} style={{ stroke:color, strokeDasharray:circ, strokeDashoffset:offset }}/>
      </svg>
      <div className="label" style={{ color }}>{value}</div>
    </div>
  );
}

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({length:28},(_,i)=>({ id:i, left:`${Math.random()*100}vw`, delay:`${Math.random()*1.5}s`, color:["#6C63FF","#FF6B9D","#43E97B","#F7C948","#38B2FF"][i%5], w:`${7+Math.random()*7}px` }));
  return <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden" }}>{pieces.map(p=><div key={p.id} className="confetti-piece" style={{ left:p.left,background:p.color,width:p.w,height:`calc(${p.w}*1.4)`,animationDelay:p.delay }}/>)}</div>;
}

function ChatBox({ chat, msg, setMsg, send, ref: chatRef, compact }) {
  return (
    <div style={{ width:"100%",maxWidth:compact?700:460,background:"var(--bg-secondary)",borderRadius:"var(--radius)",border:"1px solid var(--border-light)",overflow:"hidden" }}>
      <div style={{ padding:"7px 12px",borderBottom:"1px solid var(--border-light)",fontSize:"0.78rem",fontWeight:700,color:"var(--text-muted)" }}>💬 Chat</div>
      <div ref={chatRef} style={{ height:compact?90:170,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:4 }}>
        {chat.length===0?<span style={{ color:"var(--text-muted)",fontSize:"0.76rem" }}>No messages yet…</span>:chat.map(m=>(
          <div key={m.id} style={{ fontSize:"0.8rem" }}><span style={{ fontWeight:700,color:"var(--accent)" }}>{m.playerName}: </span><span style={{ color:"var(--text-secondary)" }}>{m.message}</span></div>
        ))}
      </div>
      <div style={{ display:"flex",gap:6,padding:"6px 8px",borderTop:"1px solid var(--border-light)" }}>
        <input className="input" style={{ flex:1,padding:"7px 10px",fontSize:"0.8rem" }} placeholder="Message…" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button onClick={send} className="btn btn-primary btn-sm"><Send size={12}/></button>
      </div>
    </div>
  );
}

export default function QuizGame() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = getSocket();

  const isSolo = location.state?.solo;
  const isHost = location.state?.host;

  const [phase, setPhase] = useState("lobby");
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name||"");
  const [qNum, setQNum] = useState(0);
  const [totalQ, setTotalQ] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const timerRef = useRef(null);
  const chatRef = useRef(null);

  // Solo state
  const [soloIdx, setSoloIdx] = useState(0);
  const [soloAnswered, setSoloAnswered] = useState(false);
  const [soloScore, setSoloScore] = useState(0);
  const [soloTimer, setSoloTimer] = useState(20);
  const soloTimerRef = useRef(null);
  const soloQuestions = location.state?.questions || [];

  // ── Solo mode ──
  useEffect(() => {
    if (!isSolo || !soloQuestions.length) return;
    setPhase("question"); setQuestion(soloQuestions[0]); setTotalQ(soloQuestions.length);
    startSoloTimer(20);
    return () => clearInterval(soloTimerRef.current);
  }, [isSolo]);

  const startSoloTimer = t => {
    setSoloTimer(t); clearInterval(soloTimerRef.current);
    soloTimerRef.current = setInterval(() => setSoloTimer(p => { if (p<=1){ clearInterval(soloTimerRef.current); soloAnswer(-1); return 0; } return p-1; }), 1000);
  };
  const soloAnswer = idx => {
    if (soloAnswered) return;
    setSoloAnswered(true); clearInterval(soloTimerRef.current);
    const q = soloQuestions[soloIdx];
    const correct = idx===q.correct;
    const pts = correct ? Math.max(500, Math.round(1000*(soloTimer/20))) : 0;
    setSoloScore(p=>p+pts);
    setSelected(idx);
    setResult({ correct, correctAnswer:q.correct, explanation:q.explanation, points:pts });
  };
  const soloNext = () => {
    const next = soloIdx+1;
    if (next>=soloQuestions.length){ setPhase("ended"); setLeaderboard([{ name:user?.name||"You", score:soloScore+(result?.points||0) }]); setConfetti(true); return; }
    setSoloIdx(next); setQuestion(soloQuestions[next]); setQNum(next); setSelected(null); setSoloAnswered(false); setResult(null); startSoloTimer(20);
  };

  // ── Multiplayer ──
  useEffect(() => {
    if (isSolo) return;
    if (isHost && location.state?.room) {
      const r = location.state.room;
      setRoom(r); setPlayers([{ id:"host", name:user?.name||"Host", score:0 }]);
      setJoined(true); setTotalQ(r.totalQuestions||10);
      socket.emit("quiz:join", { code, playerName:user?.name, userId:user?.id });
    }
    socket.on("quiz:joined", ({ room:r }) => { setRoom(r); setJoined(true); setTotalQ(r.totalQuestions||10); });
    socket.on("quiz:playerJoined", ({ players:p }) => setPlayers(p));
    socket.on("quiz:playerLeft", ({ players:p }) => setPlayers(p));
    socket.on("quiz:started", ({ totalQuestions:t }) => { setTotalQ(t); setPhase("question"); });
    socket.on("quiz:question", ({ question:q, timeLimit }) => {
      setQuestion(q); setTimeLeft(timeLimit); setSelected(null); setResult(null); setPhase("question"); setQNum(q.index+1);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft(p=>{ if(p<=1){ clearInterval(timerRef.current); return 0; } return p-1; }), 1000);
    });
    socket.on("quiz:answerResult", r => { setResult(r); setMyScore(r.totalScore); clearInterval(timerRef.current); });
    socket.on("quiz:leaderboard", ({ leaderboard:lb, correctAnswer, explanation }) => {
      setLeaderboard(lb); setResult(p=>p||{ correct:false, correctAnswer, explanation, points:0 }); setPhase("leaderboard");
    });
    socket.on("quiz:ended", ({ leaderboard:lb }) => {
      setLeaderboard(lb); setPhase("ended");
      if (lb[0]?.id===socket.id) setConfetti(true);
    });
    socket.on("quiz:chat", m => { setChat(p=>[...p,m]); setTimeout(()=>chatRef.current?.scrollTo(0,99999),50); });
    socket.on("error", m => toast.error(m));
    return () => {
      ["quiz:joined","quiz:playerJoined","quiz:playerLeft","quiz:started","quiz:question","quiz:answerResult","quiz:leaderboard","quiz:ended","quiz:chat","error"].forEach(e=>socket.off(e));
      clearInterval(timerRef.current);
    };
  }, [isSolo]);

  const joinGame = () => {
    if (!nameInput.trim()) return toast.error("Enter your name");
    socket.data = { roomCode:code, userId:user?.id };
    socket.emit("quiz:join", { code, playerName:nameInput, userId:user?.id });
  };
  const answer = idx => {
    if (selected!==null || result) return;
    setSelected(idx);
    socket.emit("quiz:answer", { code, questionIndex:qNum-1, answerIndex:idx, timeLeft });
  };
  const sendChat = () => { if (!chatMsg.trim()) return; socket.emit("quiz:chat",{code,message:chatMsg}); setChatMsg(""); };
  const startGame = () => socket.emit("quiz:start", { code });

  // ── Join screen ──
  if (!isSolo && !joined) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-primary)",padding:24 }}>
      <div className="card animate-fade" style={{ maxWidth:380,width:"100%",padding:34,textAlign:"center" }}>
        <div style={{ width:60,height:60,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}><Zap size={30} color="white"/></div>
        <h2 style={{ fontWeight:800,fontSize:"1.3rem",marginBottom:4 }}>Join Quiz</h2>
        <div className="badge badge-accent" style={{ margin:"0 auto 18px" }}>Room: {code}</div>
        <div style={{ marginBottom:14 }}>
          <label className="label">Your Name</label>
          <input className="input" placeholder="Enter your name…" value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinGame()} autoFocus/>
        </div>
        <button onClick={joinGame} className="btn btn-primary btn-lg w-full">Join Game 🚀</button>
        <Link to="/" style={{ display:"block",marginTop:12,color:"var(--text-muted)",fontSize:"0.82rem",textDecoration:"none" }}>Back to home</Link>
      </div>
    </div>
  );

  // ── Lobby ──
  if (!isSolo && phase==="lobby") return (
    <div style={{ minHeight:"100vh",background:"var(--bg-primary)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:24 }}>
      <div className="card animate-fade" style={{ maxWidth:480,width:"100%",padding:30 }}>
        <div style={{ textAlign:"center",marginBottom:22 }}>
          <h2 style={{ fontWeight:800,fontSize:"1.3rem",marginBottom:8 }}>{room?.title||"Quiz Lobby"}</h2>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10 }}>
            <div style={{ background:"var(--bg-secondary)",borderRadius:10,padding:"10px 22px",fontSize:"1.5rem",fontWeight:800,letterSpacing:"0.15em",color:"var(--accent)" }}>{code}</div>
            <button onClick={()=>{navigator.clipboard.writeText(code);toast.success("Copied!");}} className="btn btn-secondary btn-icon"><Copy size={15}/></button>
          </div>
          <p style={{ color:"var(--text-muted)",fontSize:"0.82rem" }}>Share this code with friends</p>
        </div>
        <div style={{ marginBottom:20 }}>
          <div className="flex-between" style={{ marginBottom:10 }}>
            <span style={{ fontWeight:700,display:"flex",alignItems:"center",gap:6 }}><Users size={15}/> Players ({players.length})</span>
            <div className="glow-dot"/>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:8,maxHeight:200,overflowY:"auto" }}>
            {players.map((p,i) => (
              <div key={p.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:"var(--bg-secondary)",borderRadius:10 }}>
                <div style={{ width:30,height:30,background:`hsl(${i*60},60%,50%)`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",color:"white" }}>{p.name.charAt(0).toUpperCase()}</div>
                <span style={{ fontWeight:600,fontSize:"0.88rem" }}>{p.name}</span>
                {p.id===socket.id && <span className="badge badge-accent" style={{ marginLeft:"auto",fontSize:"0.68rem" }}>You</span>}
              </div>
            ))}
          </div>
        </div>
        {isHost ? <button onClick={startGame} className="btn btn-primary btn-lg w-full"><Zap size={17}/> Start Game</button>
          : <p style={{ textAlign:"center",color:"var(--text-muted)",fontSize:"0.88rem" }}>Waiting for host…</p>}
      </div>
      <ChatBox chat={chat} msg={chatMsg} setMsg={setChatMsg} send={sendChat} ref={chatRef}/>
    </div>
  );

  // ── Question ──
  if (phase==="question" && question) {
    const answered = isSolo ? soloAnswered : (selected!==null||!!result);
    const cTimer = isSolo ? soloTimer : timeLeft;
    const maxTime = isSolo ? 20 : (room?.timePerQuestion||20);
    return (
      <div style={{ minHeight:"100vh",background:"var(--bg-primary)",display:"flex",flexDirection:"column",padding:16,gap:12 }}>
        <div style={{ maxWidth:700,margin:"0 auto",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div className="badge badge-accent">Q {isSolo?soloIdx+1:qNum} / {totalQ}</div>
          <RingTimer value={cTimer} max={maxTime}/>
          {!isSolo && <div style={{ fontWeight:800,color:"var(--accent-4)",display:"flex",alignItems:"center",gap:5 }}><Zap size={14}/>{myScore}</div>}
        </div>
        <div style={{ maxWidth:700,margin:"0 auto",width:"100%" }}>
          <div className="progress-bar" style={{ height:6 }}><div style={{ height:"100%",width:`${(cTimer/maxTime)*100}%`,background:cTimer<=5?"#FF6363":"linear-gradient(90deg,var(--accent),var(--accent-2))",borderRadius:99,transition:"width 1s linear" }}/></div>
        </div>
        <div style={{ maxWidth:700,margin:"0 auto",width:"100%",textAlign:"center",padding:"10px 0" }}>
          <p style={{ fontWeight:700,fontSize:"clamp(1rem,3vw,1.25rem)",lineHeight:1.5 }}>{question.question}</p>
        </div>
        <div style={{ maxWidth:700,margin:"0 auto",width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {question.options.map((opt,i) => {
            let extra = {};
            if (answered && result) {
              if (i===result.correctAnswer) extra = { borderColor:"var(--accent-3)",background:"rgba(67,233,123,0.15)" };
              else if (i===selected && i!==result.correctAnswer) extra = { borderColor:"#FF6363",background:"rgba(255,99,99,0.15)" };
            }
            return (
              <button key={i} disabled={answered} onClick={()=>isSolo?soloAnswer(i):answer(i)}
                style={{ background:`${OPT_COLORS[i]}18`,border:`2px solid ${answered?OPT_COLORS[i]+"40":OPT_COLORS[i]}`,borderRadius:"var(--radius)",padding:"15px 18px",cursor:answered?"default":"pointer",transition:"all 0.2s",fontWeight:700,textAlign:"left",color:"var(--text-primary)",fontFamily:"var(--font)",fontSize:"0.9rem",display:"flex",alignItems:"center",gap:11,...(selected===i&&!answered?{borderColor:OPT_COLORS[i],background:`${OPT_COLORS[i]}25`}:{}),...extra }}>
                <span style={{ width:28,height:28,background:OPT_COLORS[i],borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:"0.82rem",flexShrink:0 }}>{OPT_LETTERS[i]}</span>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && result && (
          <div style={{ maxWidth:700,margin:"0 auto",width:"100%",padding:16,borderRadius:"var(--radius)",background:result.correct?"rgba(67,233,123,0.08)":"rgba(255,99,99,0.08)",border:`1px solid ${result.correct?"rgba(67,233,123,0.25)":"rgba(255,99,99,0.25)"}`,textAlign:"center" }}>
            <div style={{ fontSize:"1.5rem",marginBottom:4 }}>{result.correct?"🎉":"😅"}</div>
            <div style={{ fontWeight:700,color:result.correct?"var(--accent-3)":"#FF6363",marginBottom:4 }}>
              {result.correct?`+${result.points} points!`:"Incorrect"} {result.points>800&&"⚡ Speed bonus!"}
            </div>
            {result.explanation&&<p style={{ color:"var(--text-secondary)",fontSize:"0.84rem",lineHeight:1.6 }}>{result.explanation}</p>}
            {isSolo&&<button onClick={soloNext} className="btn btn-primary btn-sm" style={{ marginTop:12 }}>{soloIdx+1>=totalQ?"See Results →":"Next →"}</button>}
          </div>
        )}
        {!isSolo&&<div style={{ maxWidth:700,margin:"0 auto",width:"100%" }}><ChatBox chat={chat} msg={chatMsg} setMsg={setChatMsg} send={sendChat} ref={chatRef} compact/></div>}
      </div>
    );
  }

  // ── Leaderboard ──
  if (phase==="leaderboard") return (
    <div style={{ minHeight:"100vh",background:"var(--bg-primary)",display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:24 }}>
      <h2 style={{ fontWeight:800,fontSize:"1.35rem" }}>Leaderboard</h2>
      <div style={{ width:"100%",maxWidth:440 }}>
        {leaderboard.slice(0,8).map((p,i) => (
          <div key={p.id||i} className={`card ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":""}`} style={{ display:"flex",alignItems:"center",gap:13,padding:"13px 17px",marginBottom:8 }}>
            <span style={{ width:26,fontWeight:800,fontSize:"1.05rem",textAlign:"center" }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
            <div style={{ width:34,height:34,background:`hsl(${i*60},60%,50%)`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white",flexShrink:0 }}>{p.name.charAt(0).toUpperCase()}</div>
            <span style={{ flex:1,fontWeight:700,fontSize:"0.9rem" }}>{p.name}</span>
            <span style={{ fontWeight:800,color:"var(--accent-4)",display:"flex",alignItems:"center",gap:4 }}><Zap size={13}/>{p.score}</span>
          </div>
        ))}
      </div>
      <p style={{ color:"var(--text-muted)",fontSize:"0.83rem" }}>Next question coming up…</p>
      <ChatBox chat={chat} msg={chatMsg} setMsg={setChatMsg} send={sendChat} ref={chatRef}/>
    </div>
  );

  // ── Ended ──
  if (phase==="ended") {
    const myRank = isSolo ? 1 : leaderboard.findIndex(p=>p.id===socket.id)+1;
    const finalScore = isSolo ? soloScore+(result?.points||0) : myScore;
    return (
      <div style={{ minHeight:"100vh",background:"var(--bg-primary)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:24 }}>
        <Confetti active={confetti}/>
        <div className="card" style={{ maxWidth:480,width:"100%",textAlign:"center",padding:34 }}>
          <Trophy size={48} color="var(--accent-4)" style={{ margin:"0 auto 12px" }}/>
          <h2 style={{ fontWeight:800,fontSize:"1.5rem",marginBottom:4 }}>Game Over!</h2>
          {!isSolo&&<div style={{ color:"var(--text-secondary)",marginBottom:12 }}>You finished #{myRank}</div>}
          <div style={{ fontSize:"2.3rem",fontWeight:800,color:"var(--accent-4)",marginBottom:20 }}>{finalScore} pts</div>
          <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
            <button onClick={()=>navigate("/quiz")} className="btn btn-primary"><Home size={15}/> Play Again</button>
            <button onClick={()=>navigate("/dashboard")} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
        {leaderboard.length>0&&(
          <div style={{ width:"100%",maxWidth:440 }}>
            <h3 style={{ fontWeight:700,textAlign:"center",marginBottom:12 }}>Final Standings</h3>
            {leaderboard.slice(0,10).map((p,i) => (
              <div key={p.id||i} className={`card ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":""}`} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 16px",marginBottom:8 }}>
                <span style={{ width:24,fontWeight:800,textAlign:"center" }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                <span style={{ flex:1,fontWeight:600,fontSize:"0.88rem" }}>{p.name}</span>
                <span style={{ fontWeight:800,color:"var(--accent-4)" }}>{p.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="page flex-center" style={{ paddingTop:80 }}><div style={{ width:40,height:40,border:"3px solid rgba(108,99,255,0.2)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/></div>;
}
