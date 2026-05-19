import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Gamepad2, Plus, Users, User, Upload, FileText, Loader, Zap, Globe, Lock } from "lucide-react";

export default function QuizLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [tab, setTab] = useState("create");
  const [mode, setMode] = useState("solo");
  const [srcTab, setSrcTab] = useState("notes");
  const [selNote, setSelNote] = useState(null);
  const [customText, setCustomText] = useState("");
  const [qCount, setQCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [isPublic, setIsPublic] = useState(false);
  const [timePerQ, setTimePerQ] = useState(20);
  const [quizTitle, setQuizTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadName, setUploadName] = useState("");

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {});
    if (location.state?.questions) startWithQuestions(location.state.questions, location.state.sourceNote?.title || "Quick Quiz");
  }, []);

  const onDrop = async ([f]) => {
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f); fd.append("title", f.name);
    setLoading(true);
    try {
      const { data } = await api.post("/notes/upload", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setUploadContent(data.content); setUploadName(data.title);
      toast.success("File extracted!");
    } catch { toast.error("Upload failed"); }
    finally { setLoading(false); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple:false, maxSize:25*1024*1024 });

  const getContent = () => srcTab==="notes" ? selNote?.content||"" : srcTab==="upload" ? uploadContent : customText;

  const buildQuiz = async () => {
    const content = getContent();
    if (!content.trim()) { toast.error("Please select or provide content"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate-quiz", { content, count:qCount, difficulty });
      if (!data.questions?.length) { toast.error("Could not generate questions — try different content"); return; }
      await startWithQuestions(data.questions, quizTitle || selNote?.title || "Study Quiz");
    } catch(err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setLoading(false); }
  };

  const startWithQuestions = async (questions, title) => {
    if (mode === "solo") { navigate("/quiz/join/SOLO", { state:{ solo:true, questions, title } }); return; }
    try {
      const { data } = await api.post("/quiz/create", { title, questions, isPublic, timePerQuestion:timePerQ });
      navigate(`/quiz/join/${data.room.code}`, { state:{ host:true, room:data.room } });
    } catch { toast.error("Failed to create room"); }
  };

  return (
    <div className="page" style={{ paddingTop:32, maxWidth:760 }}>
      <div style={{ marginBottom:26 }}>
        <h1 style={{ fontWeight:800, fontSize:"1.6rem", marginBottom:4 }}>Quiz Arena</h1>
        <p style={{ color:"var(--text-secondary)" }}>Solo practice or live multiplayer battles</p>
      </div>
      <div className="tabs" style={{ marginBottom:22 }}>
        <button className={`tab ${tab==="create"?"active":""}`} onClick={()=>setTab("create")}><Plus size={13}/> Create</button>
        <button className={`tab ${tab==="join"?"active":""}`} onClick={()=>setTab("join")}><Users size={13}/> Join</button>
      </div>

      {tab==="join" ? (
        <div className="card" style={{ padding:36, textAlign:"center" }}>
          <Gamepad2 size={44} color="var(--accent)" style={{ margin:"0 auto 14px" }}/>
          <h2 style={{ fontWeight:700, marginBottom:8 }}>Join a Live Game</h2>
          <p style={{ color:"var(--text-secondary)", marginBottom:22 }}>Enter the room code from your host</p>
          <div style={{ display:"flex", gap:10, maxWidth:340, margin:"0 auto" }}>
            <input className="input" placeholder="Enter code…" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
              style={{ textAlign:"center", letterSpacing:"0.15em", fontWeight:700, fontSize:"1.1rem" }}
              onKeyDown={e=>e.key==="Enter"&&navigate(`/quiz/join/${joinCode.toUpperCase()}`)}/>
            <button onClick={()=>navigate(`/quiz/join/${joinCode.toUpperCase()}`)} className="btn btn-primary">Join</button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {/* Mode */}
          <div>
            <label className="label" style={{ marginBottom:10 }}>Game Mode</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[{ v:"solo", icon:User, label:"Solo Practice", desc:"Study at your own pace", c:"var(--accent)" },
                { v:"multi", icon:Users, label:"Multiplayer", desc:"Live battle (Kahoot-style)", c:"var(--accent-3)" }].map(({ v,icon:Icon,label,desc,c }) => (
                <div key={v} onClick={()=>setMode(v)} style={{ padding:18, borderRadius:"var(--radius)", border:`2px solid ${mode===v?c:"var(--border-light)"}`, background:mode===v?`${c}0d`:"var(--bg-card)", cursor:"pointer", transition:"all 0.2s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}><Icon size={19} color={c}/><span style={{ fontWeight:700, color:mode===v?c:"var(--text-primary)" }}>{label}</span></div>
                  <p style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content source */}
          <div>
            <label className="label" style={{ marginBottom:10 }}>Content Source</label>
            <div className="tabs" style={{ marginBottom:14 }}>
              <button className={`tab ${srcTab==="notes"?"active":""}`} onClick={()=>setSrcTab("notes")}><FileText size={12}/> My Notes</button>
              <button className={`tab ${srcTab==="upload"?"active":""}`} onClick={()=>setSrcTab("upload")}><Upload size={12}/> Upload</button>
              <button className={`tab ${srcTab==="write"?"active":""}`} onClick={()=>setSrcTab("write")}>✏️ Write</button>
            </div>
            {srcTab==="notes" && (notes.length===0 ? (
              <div className="card" style={{ textAlign:"center", padding:22 }}>
                <p style={{ color:"var(--text-muted)", fontSize:"0.85rem", marginBottom:10 }}>No notes found.</p>
                <a href="/notes" className="btn btn-secondary btn-sm">Upload Notes</a>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:10, maxHeight:220, overflowY:"auto" }}>
                {notes.map(n => (
                  <div key={n.id} onClick={()=>setSelNote(n)} style={{ padding:12, borderRadius:10, border:`2px solid ${selNote?.id===n.id?"var(--accent)":"var(--border-light)"}`, background:selNote?.id===n.id?"rgba(108,99,255,0.08)":"var(--bg-secondary)", cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ fontWeight:600, fontSize:"0.83rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title}</div>
                    <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginTop:3 }}>{n.content?.length?.toLocaleString()} chars</div>
                  </div>
                ))}
              </div>
            ))}
            {srcTab==="upload" && (
              <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius)", padding:22, textAlign:"center", cursor:"pointer", background:isDragActive?"rgba(108,99,255,0.05)":"transparent" }}>
                <input {...getInputProps()}/>
                <Upload size={26} color="var(--text-muted)" style={{ margin:"0 auto 8px" }}/>
                {uploadContent ? <div style={{ color:"var(--accent-3)", fontWeight:600 }}>✓ {uploadName}</div> : <div style={{ color:"var(--text-muted)", fontSize:"0.88rem" }}>Drop or click to upload (PDF, DOCX, PPTX…)</div>}
              </div>
            )}
            {srcTab==="write" && <textarea className="input" placeholder="Paste or write your study material…" value={customText} onChange={e=>setCustomText(e.target.value)} style={{ minHeight:150 }}/>}
          </div>

          {/* Settings */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div><label className="label">Quiz Title</label><input className="input" placeholder="My Quiz" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)}/></div>
            <div><label className="label">Questions</label><select className="input" value={qCount} onChange={e=>setQCount(+e.target.value)}>{[5,10,15,20,25].map(n=><option key={n} value={n}>{n} questions</option>)}</select></div>
            <div><label className="label">Difficulty</label><select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
            {mode==="multi" && <div><label className="label">Time per Question</label><select className="input" value={timePerQ} onChange={e=>setTimePerQ(+e.target.value)}>{[10,15,20,30,45,60].map(n=><option key={n} value={n}>{n}s</option>)}</select></div>}
          </div>

          {mode==="multi" && (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--bg-secondary)", borderRadius:10 }}>
              <div onClick={()=>setIsPublic(p=>!p)} style={{ width:42, height:22, background:isPublic?"var(--accent)":"var(--bg-hover)", borderRadius:11, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ width:16, height:16, background:"white", borderRadius:"50%", position:"absolute", top:3, left:isPublic?22:3, transition:"left 0.2s" }}/>
              </div>
              {isPublic?<Globe size={15} color="var(--accent)"/>:<Lock size={15} color="var(--text-muted)"/>}
              <span style={{ fontSize:"0.86rem", fontWeight:600 }}>{isPublic?"Public room":"Private room"}</span>
            </div>
          )}

          <button onClick={buildQuiz} className="btn btn-primary btn-lg" disabled={loading || !getContent().trim()}>
            {loading ? <><Loader size={17} className="animate-spin"/> Generating…</> : <><Zap size={17}/>{mode==="solo"?"Start Solo Quiz":"Create Room & Generate Quiz"}</>}
          </button>
        </div>
      )}
    </div>
  );
}
