import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, RotateCcw, Check, X, Shuffle, BookOpen, Loader } from "lucide-react";

export default function Flashcards() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

  useEffect(() => {
    api.get("/notes").then(r => {
      const all = r.data;
      setNotes(all.filter(n=>n.flashcards?.length>0));
      if (id) {
        const n = all.find(x=>x.id===id);
        if (n?.flashcards?.length) load(n);
        else if (n) setSelected(n);
      }
    }).finally(()=>setLoading(false));
  }, [id]);

  const load = n => { setSelected(n); setCards(shuffle([...n.flashcards])); setIdx(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false); };
  const generate = async n => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/ai/flashcards/${n.id}`, { count:15 });
      toast.success(`${data.flashcards.length} flashcards created!`);
      const updated = { ...n, flashcards:data.flashcards };
      load(updated);
      setNotes(p => p.some(x=>x.id===n.id)?p.map(x=>x.id===n.id?updated:x):[...p,updated]);
    } catch(err) { toast.error(err.response?.data?.error||"Failed"); }
    finally { setGenerating(false); }
  };
  const mark = ok => {
    if (ok) setKnown(p=>[...p,idx]); else setUnknown(p=>[...p,idx]);
    setFlipped(false);
    setTimeout(() => { if (idx+1>=cards.length) setDone(true); else setIdx(p=>p+1); }, 150);
  };
  const restart = (missedOnly=false) => {
    const nc = missedOnly ? unknown.map(i=>cards[i]) : shuffle([...cards]);
    setCards(nc); setIdx(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false);
  };

  if (loading) return <div className="page flex-center" style={{ paddingTop:80 }}><Loader size={30} className="animate-spin" color="var(--accent)"/></div>;

  if (!selected || !cards.length) return (
    <div className="page" style={{ paddingTop:32 }}>
      <div style={{ marginBottom:26 }}><h1 style={{ fontWeight:800,fontSize:"1.6rem",marginBottom:4 }}>Flashcards</h1><p style={{ color:"var(--text-secondary)" }}>Study your notes with AI-generated flashcards</p></div>
      {selected && !cards.length && (
        <div className="card" style={{ textAlign:"center",padding:44,marginBottom:22 }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ margin:"0 auto 12px" }}/>
          <h3 style={{ fontWeight:700,marginBottom:8 }}>No flashcards for "{selected.title}"</h3>
          <button onClick={()=>generate(selected)} className="btn btn-primary btn-sm" disabled={generating}>{generating?"Generating…":"Generate Flashcards"}</button>
        </div>
      )}
      {notes.length===0 ? (
        <div className="card" style={{ textAlign:"center",padding:48 }}>
          <p style={{ color:"var(--text-muted)",marginBottom:16 }}>No flashcard sets yet. Open a note and click "Make Flashcards".</p>
          <Link to="/notes" className="btn btn-primary btn-sm">Go to Notes</Link>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
          {notes.map(n => (
            <div key={n.id} onClick={()=>load(n)} className="card hover-lift" style={{ cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent-2)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
              <h3 style={{ fontWeight:700,marginBottom:6,fontSize:"0.92rem" }}>{n.title}</h3>
              <span className="badge badge-pink">{n.flashcards.length} cards</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (done) {
    const pct = Math.round((known.length/cards.length)*100);
    return (
      <div className="page flex-center" style={{ paddingTop:48,flexDirection:"column",gap:22 }}>
        <div className="card" style={{ maxWidth:460,width:"100%",textAlign:"center",padding:36 }}>
          <div style={{ fontSize:"2.8rem",marginBottom:14 }}>{pct>=80?"🎉":pct>=50?"👍":"💪"}</div>
          <h2 style={{ fontWeight:800,fontSize:"1.35rem",marginBottom:8 }}>Session Complete!</h2>
          <p style={{ color:"var(--text-secondary)",marginBottom:22 }}>{cards.length} cards · <strong>{selected.title}</strong></p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24 }}>
            <div style={{ background:"rgba(67,233,123,0.1)",borderRadius:12,padding:16 }}><div style={{ fontSize:"1.8rem",fontWeight:800,color:"var(--accent-3)" }}>{known.length}</div><div style={{ color:"var(--text-muted)",fontSize:"0.8rem" }}>Got it ✓</div></div>
            <div style={{ background:"rgba(255,99,99,0.1)",borderRadius:12,padding:16 }}><div style={{ fontSize:"1.8rem",fontWeight:800,color:"#FF6363" }}>{unknown.length}</div><div style={{ color:"var(--text-muted)",fontSize:"0.8rem" }}>Review ✗</div></div>
          </div>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center" }}>
            <button onClick={()=>restart(false)} className="btn btn-primary btn-sm"><RotateCcw size={13}/> Restart All</button>
            {unknown.length>0 && <button onClick={()=>restart(true)} className="btn btn-secondary btn-sm">Review Missed ({unknown.length})</button>}
            <button onClick={()=>{setSelected(null);setCards([]);}} className="btn btn-secondary btn-sm">Change Set</button>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[idx];
  const prog = ((known.length+unknown.length)/cards.length)*100;

  return (
    <div className="page flex-center" style={{ paddingTop:32,flexDirection:"column",gap:18 }}>
      <div style={{ width:"100%",maxWidth:580 }}>
        <div className="flex-between" style={{ marginBottom:10 }}>
          <button onClick={()=>{setSelected(null);setCards([]);}} className="btn btn-secondary btn-sm"><ArrowLeft size={13}/> Sets</button>
          <span style={{ fontWeight:700,fontSize:"0.88rem",color:"var(--text-muted)" }}>{idx+1} / {cards.length}</span>
          <button onClick={()=>restart(false)} className="btn btn-secondary btn-sm"><Shuffle size={13}/> Shuffle</button>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width:`${prog}%` }}/></div>
        <div style={{ display:"flex",justifyContent:"space-between",marginTop:5,fontSize:"0.73rem",color:"var(--text-muted)" }}>
          <span style={{ color:"var(--accent-3)" }}>✓ {known.length}</span>
          <span>{selected.title}</span>
          <span style={{ color:"#FF6363" }}>✗ {unknown.length}</span>
        </div>
      </div>

      <div className="flashcard-scene" onClick={()=>setFlipped(p=>!p)}>
        <div className={`flashcard-inner ${flipped?"flipped":""}`}>
          <div className="flashcard-face flashcard-front">
            <div style={{ fontSize:"0.72rem",color:"var(--text-muted)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em" }}>Question</div>
            <div style={{ fontSize:"1.05rem",fontWeight:700,lineHeight:1.6 }}>{card.front}</div>
            <div style={{ fontSize:"0.75rem",color:"var(--text-muted)",marginTop:14 }}>Tap to reveal</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <div style={{ fontSize:"0.72rem",color:"var(--accent)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em" }}>Answer</div>
            <div style={{ fontSize:"0.98rem",lineHeight:1.7 }}>{card.back}</div>
          </div>
        </div>
      </div>

      {flipped ? (
        <div style={{ display:"flex",gap:14 }}>
          <button onClick={()=>mark(false)} className="btn btn-danger btn-lg" style={{ minWidth:140 }}><X size={19}/> Still learning</button>
          <button onClick={()=>mark(true)} className="btn btn-success btn-lg" style={{ minWidth:140 }}><Check size={19}/> Got it!</button>
        </div>
      ) : (
        <div style={{ display:"flex",gap:10 }}>
          <button disabled={idx===0} onClick={()=>{setIdx(p=>p-1);setFlipped(false);}} className="btn btn-secondary"><ArrowLeft size={16}/></button>
          <button onClick={()=>setFlipped(true)} className="btn btn-primary btn-lg">Reveal Answer</button>
          <button disabled={idx===cards.length-1} onClick={()=>{setIdx(p=>p+1);setFlipped(false);}} className="btn btn-secondary"><ArrowRight size={16}/></button>
        </div>
      )}
    </div>
  );
}
