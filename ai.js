import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Calendar, Sparkles, Loader, BookOpen, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudyPlan() {
  const [subject, setSubject] = useState(""); const [duration, setDuration] = useState("2 weeks (2 hours/day)");
  const [goals, setGoals] = useState(""); const [level, setLevel] = useState("intermediate");
  const [style, setStyle] = useState("balanced"); const [plan, setPlan] = useState(""); const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!subject.trim()||!goals.trim()) return toast.error("Fill in subject and goals");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/study-plan", { subject:`${subject} (level:${level}, style:${style})`, duration, goals });
      setPlan(data.plan); toast.success("Study plan ready! 🎯");
    } catch(err) { toast.error(err.response?.data?.error||"Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ paddingTop:32,maxWidth:820 }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
        <div style={{ width:40,height:40,background:"linear-gradient(135deg,var(--accent-5),var(--accent))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center" }}><Calendar size={20} color="white"/></div>
        <div><h1 style={{ fontWeight:800,fontSize:"1.5rem" }}>Study Plan Generator</h1><p style={{ color:"var(--text-secondary)",fontSize:"0.85rem" }}>AI-crafted personalized schedules</p></div>
      </div>

      {!plan ? (
        <div style={{ display:"flex",flexDirection:"column",gap:18,marginTop:24 }}>
          <div><label className="label">📚 Subject / Topic</label><input className="input" placeholder="e.g. Organic Chemistry, Calculus, World War II…" value={subject} onChange={e=>setSubject(e.target.value)}/></div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div><label className="label">⏱ Available Time</label>
              <select className="input" value={duration} onChange={e=>setDuration(e.target.value)}>
                {["3 days (4 hours/day)","1 week (2-3 hours/day)","2 weeks (2 hours/day)","1 month (1 hour/day)","3 months (45 min/day)"].map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">🎯 Your Level</label>
              <select className="input" value={level} onChange={e=>setLevel(e.target.value)}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="exam-prep">Exam Prep</option>
              </select>
            </div>
            <div><label className="label">🧠 Learning Style</label>
              <select className="input" value={style} onChange={e=>setStyle(e.target.value)}>
                <option value="balanced">Balanced (theory + practice)</option><option value="visual">Visual (diagrams, mind maps)</option><option value="practice">Practice-heavy (problems)</option><option value="reading">Reading & note-taking</option>
              </select>
            </div>
          </div>
          <div><label className="label">🏆 Goals</label><textarea className="input" placeholder="What do you want to achieve? e.g. Pass my final exam, understand the fundamentals…" value={goals} onChange={e=>setGoals(e.target.value)} style={{ minHeight:90 }}/></div>
          <button onClick={generate} className="btn btn-primary btn-lg" disabled={loading||!subject.trim()||!goals.trim()}>
            {loading?<><Loader size={17} className="animate-spin"/> Crafting your plan…</>:<><Sparkles size={17}/> Generate Study Plan</>}
          </button>
        </div>
      ) : (
        <div style={{ marginTop:22 }}>
          <div className="flex-between" style={{ marginBottom:18,flexWrap:"wrap",gap:10 }}>
            <div><div style={{ fontWeight:700 }}>📋 Your Personalized Plan</div><div style={{ color:"var(--text-muted)",fontSize:"0.8rem" }}>{subject} · {duration}</div></div>
            <div style={{ display:"flex",gap:9 }}>
              <button onClick={()=>{navigator.clipboard.writeText(plan);toast.success("Copied!");}} className="btn btn-secondary btn-sm">📋 Copy</button>
              <button onClick={()=>setPlan("")} className="btn btn-secondary btn-sm">🔄 New Plan</button>
            </div>
          </div>
          <div className="card" style={{ padding:30 }}>
            <div className="md"><ReactMarkdown>{plan}</ReactMarkdown></div>
          </div>
          <div style={{ display:"flex",gap:10,marginTop:18,flexWrap:"wrap" }}>
            <Link to="/notes" className="btn btn-primary btn-sm"><BookOpen size={14}/> Add Notes</Link>
            <Link to="/quiz" className="btn btn-secondary btn-sm"><Zap size={14}/> Create Quiz</Link>
          </div>
        </div>
      )}
    </div>
  );
}
