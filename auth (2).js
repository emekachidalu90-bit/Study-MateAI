import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Sparkles, FileText, Trash2 } from "lucide-react";

export default function Tutor() {
  const [msgs, setMsgs] = useState([{ role:"assistant", content:"Hi! I'm your AI study tutor 🎓 Ask me anything — I can explain concepts, quiz you, give examples, or help you understand your notes. What are you studying today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selNote, setSelNote] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input.trim() };
    setMsgs(p=>[...p,userMsg]); setInput(""); setLoading(true);
    try {
      const { data } = await api.post("/ai/tutor", {
        messages: [...msgs,userMsg].map(m=>({ role:m.role,content:m.content })),
        noteContext: selNote?.content?.slice(0,4000),
      });
      setMsgs(p=>[...p,{ role:"assistant", content:data.reply }]);
    } catch(err) {
      toast.error("Tutor unavailable — check your GROQ_API_KEY");
      setMsgs(p=>[...p,{ role:"assistant", content:"Sorry, I'm having trouble connecting right now." }]);
    } finally { setLoading(false); }
  };

  const autoResize = e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"; };

  const suggestions = ["Explain this concept simply","Give me 3 practice questions","What are the key points?","Create a quick summary","Test me with a quiz"];

  return (
    <div className="page" style={{ paddingTop:24,display:"flex",flexDirection:"column",height:"calc(100vh - 48px)",maxWidth:860 }}>
      <div className="flex-between" style={{ marginBottom:14 }}>
        <div><h1 style={{ fontWeight:800,fontSize:"1.4rem",marginBottom:2 }}>AI Tutor</h1><p style={{ color:"var(--text-secondary)",fontSize:"0.83rem" }}>Your personal 24/7 study assistant</p></div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>setShowNotes(p=>!p)} className={`btn btn-secondary btn-sm`}>
            <FileText size={13}/>{selNote?`📎 ${selNote.title.slice(0,14)}…`:"Add Context"}
          </button>
          <button onClick={()=>setMsgs([{ role:"assistant",content:"Chat cleared! What would you like to study?" }])} className="btn btn-secondary btn-sm"><Trash2 size={13}/></button>
        </div>
      </div>

      {showNotes && (
        <div className="card" style={{ marginBottom:12,padding:14 }}>
          <div style={{ fontSize:"0.8rem",fontWeight:700,color:"var(--text-muted)",marginBottom:10 }}>📚 Add note context for the tutor:</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            <button onClick={()=>{setSelNote(null);setShowNotes(false);}} className={`btn btn-sm ${!selNote?"btn-primary":"btn-secondary"}`}>None</button>
            {notes.map(n=>(
              <button key={n.id} onClick={()=>{setSelNote(n);setShowNotes(false);}} className={`btn btn-sm ${selNote?.id===n.id?"btn-primary":"btn-secondary"}`} style={{ maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{n.title}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14,paddingBottom:8 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",animation:"fadeIn 0.2s ease" }}>
            <div style={{ width:34,height:34,borderRadius:10,background:m.role==="assistant"?"linear-gradient(135deg,var(--accent),var(--accent-2))":"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}>
              {m.role==="assistant"?<Bot size={17} color="white"/>:<User size={17} color="var(--text-secondary)"/>}
            </div>
            <div style={{ flex:1,maxWidth:"85%" }}>
              <div style={{ fontSize:"0.72rem",color:"var(--text-muted)",marginBottom:4,fontWeight:600 }}>{m.role==="assistant"?"StudyMate AI":"You"}</div>
              <div style={{ background:m.role==="assistant"?"var(--bg-card)":"rgba(108,99,255,0.1)",border:`1px solid ${m.role==="assistant"?"var(--border-light)":"rgba(108,99,255,0.2)"}`,borderRadius:m.role==="assistant"?"4px 14px 14px 14px":"14px 4px 14px 14px",padding:"11px 15px",fontSize:"0.88rem",lineHeight:1.7 }}>
                {m.role==="assistant"?<div className="md"><ReactMarkdown>{m.content}</ReactMarkdown></div>:<span>{m.content}</span>}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
            <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",display:"flex",alignItems:"center",justifyContent:"center" }}><Bot size={17} color="white"/></div>
            <div style={{ background:"var(--bg-card)",border:"1px solid var(--border-light)",borderRadius:"4px 14px 14px 14px",padding:"13px 17px",display:"flex",gap:5,alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {msgs.length<3&&(
        <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:10 }}>
          {suggestions.map(s=>(
            <button key={s} onClick={()=>{setInput(s);taRef.current?.focus();}} style={{ padding:"5px 12px",borderRadius:99,border:"1px solid var(--border)",background:"var(--bg-secondary)",color:"var(--text-secondary)",fontSize:"0.76rem",cursor:"pointer",transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.color="";}}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"flex",gap:10,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"10px 14px",alignItems:"flex-end" }}>
        <textarea ref={taRef} value={input} onChange={e=>{setInput(e.target.value);autoResize(e);}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Ask me anything… (Enter to send)" rows={1}
          style={{ flex:1,background:"transparent",border:"none",color:"var(--text-primary)",fontFamily:"var(--font)",fontSize:"0.88rem",resize:"none",outline:"none",lineHeight:1.6,maxHeight:160 }}/>
        <button onClick={send} disabled={loading||!input.trim()} className="btn btn-primary" style={{ padding:"10px 16px",flexShrink:0 }}><Send size={15}/></button>
      </div>
    </div>
  );
}
