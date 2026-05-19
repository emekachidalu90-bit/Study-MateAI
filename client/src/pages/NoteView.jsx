import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Sparkles, Layers, Gamepad2, Map, Loader, ChevronDown, ChevronUp, Tag, Clock } from "lucide-react";

function MindMap({ mindmap }) {
  const colors = ["var(--accent)","var(--accent-2)","var(--accent-3)","var(--accent-4)","var(--accent-5)","#A78BFA"];
  return (
    <div style={{ overflowX:"auto",padding:20 }}>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:24,minWidth:600 }}>
        <div style={{ background:"linear-gradient(135deg,var(--accent),var(--accent-2))",color:"white",padding:"12px 28px",borderRadius:"var(--radius)",fontWeight:800,fontSize:"1.05rem",boxShadow:"0 0 30px rgba(108,99,255,0.3)" }}>
          {mindmap.center}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:16,width:"100%" }}>
          {mindmap.branches?.map((b,i) => (
            <div key={i} style={{ display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ background:`${colors[i%colors.length]}18`,border:`2px solid ${colors[i%colors.length]}40`,borderRadius:"var(--radius-sm)",padding:"10px 14px",fontWeight:700,color:colors[i%colors.length],textAlign:"center" }}>{b.label}</div>
              {b.children?.map((c,j) => (
                <div key={j} style={{ marginLeft:10,padding:"7px 12px",background:"var(--bg-secondary)",borderRadius:8,fontSize:"0.83rem",color:"var(--text-secondary)",borderLeft:`3px solid ${colors[i%colors.length]}60` }}>{c}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("content");
  const [busy, setBusy] = useState("");
  const [showFull, setShowFull] = useState(false);
  const [mindmap, setMindmap] = useState(null);

  useEffect(() => {
    api.get(`/notes/${id}`).then(r => setNote(r.data)).catch(() => navigate("/notes")).finally(() => setLoading(false));
  }, [id]);

  const run = async (action) => {
    setBusy(action);
    try {
      if (action === "summary") {
        const { data } = await api.post(`/ai/summarize/${id}`);
        setNote(p => ({ ...p, summary:data.summary }));
        setTab("summary");
        toast.success("Summary ready!");
      } else if (action === "flashcards") {
        const { data } = await api.post(`/ai/flashcards/${id}`, { count:15 });
        setNote(p => ({ ...p, flashcards:data.flashcards }));
        toast.success(`${data.flashcards.length} flashcards created!`);
      } else if (action === "quiz") {
        const { data } = await api.post("/ai/generate-quiz", { content:note.content, count:10 });
        navigate("/quiz", { state:{ questions:data.questions, sourceNote:note } });
      } else if (action === "mindmap") {
        const { data } = await api.post(`/ai/mindmap/${id}`);
        setMindmap(data.mindmap);
        setTab("mindmap");
        toast.success("Mind map generated!");
      }
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setBusy(""); }
  };

  if (loading) return <div className="page flex-center" style={{ paddingTop:80 }}><Loader size={30} className="animate-spin" color="var(--accent)"/></div>;
  if (!note) return null;

  return (
    <div className="page" style={{ paddingTop:24,maxWidth:900 }}>
      <Link to="/notes" style={{ display:"inline-flex",alignItems:"center",gap:6,color:"var(--text-secondary)",fontSize:"0.84rem",textDecoration:"none",marginBottom:18 }}>
        <ArrowLeft size={15}/> Back to Notes
      </Link>
      <div className="card" style={{ marginBottom:18,padding:22 }}>
        <h1 style={{ fontWeight:800,fontSize:"1.45rem",marginBottom:10 }}>{note.title}</h1>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
          <span style={{ fontSize:"0.75rem",color:"var(--text-muted)",display:"flex",alignItems:"center",gap:4 }}><Clock size={11}/>{new Date(note.createdAt).toLocaleDateString()}</span>
          {note.tags?.map(t => <span key={t} className="badge badge-accent" style={{ fontSize:"0.7rem" }}><Tag size={9}/>{t}</span>)}
          {note.flashcards?.length>0 && <span className="badge badge-pink">{note.flashcards.length} flashcards</span>}
        </div>
      </div>

      {/* AI buttons */}
      <div style={{ display:"flex",gap:9,marginBottom:18,flexWrap:"wrap" }}>
        {[
          { key:"summary",    icon:Sparkles, label:"AI Summary"    },
          { key:"flashcards", icon:Layers,   label:"Make Flashcards" },
          { key:"quiz",       icon:Gamepad2, label:"Create Quiz"  },
          { key:"mindmap",    icon:Map,      label:"Mind Map"     },
        ].map(({ key, icon:Icon, label }) => (
          <button key={key} onClick={() => run(key)} className="btn btn-secondary btn-sm" disabled={!!busy}>
            {busy===key ? <Loader size={13} className="animate-spin"/> : <Icon size={13}/>} {busy===key?"Working…":label}
          </button>
        ))}
        {note.flashcards?.length>0 && (
          <Link to={`/flashcards/${note.id}`} className="btn btn-primary btn-sm"><Layers size={13}/> Study ({note.flashcards.length})</Link>
        )}
      </div>

      <div className="tabs" style={{ marginBottom:18 }}>
        {["content","summary","mindmap"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)} style={{ textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>

      {tab==="content" && (
        <div className="card" style={{ padding:26 }}>
          <pre style={{ color:"var(--text-secondary)",fontSize:"0.84rem",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"var(--font-mono)",overflowX:"auto" }}>
            {showFull ? note.content : note.content?.slice(0,2000)}
          </pre>
          {note.content?.length>2000 && (
            <button onClick={()=>setShowFull(p=>!p)} className="btn btn-secondary btn-sm" style={{ marginTop:14 }}>
              {showFull?<><ChevronUp size={13}/> Show Less</>:<><ChevronDown size={13}/> Show More ({note.content.length-2000} more chars)</>}
            </button>
          )}
        </div>
      )}
      {tab==="summary" && (
        <div className="card" style={{ padding:26 }}>
          {note.summary ? (
            <div className="md"><ReactMarkdown>{note.summary}</ReactMarkdown></div>
          ) : (
            <div style={{ textAlign:"center",padding:40 }}>
              <Sparkles size={36} color="var(--text-muted)" style={{ margin:"0 auto 12px" }}/>
              <p style={{ color:"var(--text-muted)",marginBottom:16 }}>No summary yet</p>
              <button onClick={()=>run("summary")} className="btn btn-primary btn-sm" disabled={!!busy}>{busy==="summary"?"Generating…":"Generate Summary"}</button>
            </div>
          )}
        </div>
      )}
      {tab==="mindmap" && (
        <div className="card" style={{ padding:26 }}>
          {mindmap ? <MindMap mindmap={mindmap}/> : (
            <div style={{ textAlign:"center",padding:40 }}>
              <Map size={36} color="var(--text-muted)" style={{ margin:"0 auto 12px" }}/>
              <p style={{ color:"var(--text-muted)",marginBottom:16 }}>Generate a visual mind map from your notes</p>
              <button onClick={()=>run("mindmap")} className="btn btn-primary btn-sm" disabled={!!busy}>{busy==="mindmap"?"Generating…":"Generate Mind Map"}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
