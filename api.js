import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FileText, Upload, Plus, Search, Trash2, Eye, Layers, Clock, Tag, X, File } from "lucide-react";

function UploadModal({ onClose, onDone }) {
  const [tab, setTab] = useState("file");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(([f]) => { if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/,"")); } }, [title]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple:false, maxSize:25*1024*1024 });

  const submit = async () => {
    setLoading(true);
    try {
      if (tab === "file") {
        if (!file) return toast.error("Select a file");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title || file.name);
        fd.append("tags", tags);
        const { data } = await api.post("/notes/upload", fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success("File uploaded & text extracted! 📄");
        onDone(data);
      } else {
        if (!title.trim() || !content.trim()) return toast.error("Title and content required");
        const { data } = await api.post("/notes", { title, content, tags: tags.split(",").map(t=>t.trim()).filter(Boolean) });
        toast.success("Note saved! ✅");
        onDone(data);
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:540 }}>
        <div className="flex-between" style={{ marginBottom:20 }}>
          <h2 style={{ fontWeight:800,fontSize:"1.2rem" }}>Add Note</h2>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={17}/></button>
        </div>
        <div className="tabs" style={{ marginBottom:20 }}>
          <button className={`tab ${tab==="file"?"active":""}`} onClick={()=>setTab("file")}><Upload size={13}/> Upload File</button>
          <button className={`tab ${tab==="text"?"active":""}`} onClick={()=>setTab("text")}><FileText size={13}/> Write Note</button>
        </div>
        {tab==="file" ? (
          <>
            <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?"var(--accent)":"var(--border)"}`,borderRadius:"var(--radius)",padding:28,textAlign:"center",cursor:"pointer",marginBottom:14,background:isDragActive?"rgba(108,99,255,0.05)":"transparent",transition:"all 0.2s" }}>
              <input {...getInputProps()}/>
              <Upload size={28} color={isDragActive?"var(--accent)":"var(--text-muted)"} style={{ margin:"0 auto 10px" }}/>
              {file ? <div><div style={{ fontWeight:700,color:"var(--accent)" }}>{file.name}</div><div style={{ color:"var(--text-muted)",fontSize:"0.78rem" }}>{(file.size/1024/1024).toFixed(2)} MB</div></div>
                : <><div style={{ fontWeight:600,marginBottom:4 }}>{isDragActive?"Drop it!":"Drop file or click to browse"}</div><div style={{ color:"var(--text-muted)",fontSize:"0.8rem" }}>PDF, DOCX, PPTX, XLSX, TXT, MD — max 25MB</div></>}
            </div>
            <div style={{ marginBottom:14 }}>
              <label className="label">Title (optional)</label>
              <input className="input" placeholder="Note title…" value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:14 }}><label className="label">Title</label><input className="input" placeholder="Note title…" value={title} onChange={e=>setTitle(e.target.value)} required/></div>
            <div style={{ marginBottom:14 }}><label className="label">Content</label><textarea className="input" placeholder="Write notes here…" value={content} onChange={e=>setContent(e.target.value)} style={{ minHeight:150 }}/></div>
          </>
        )}
        <div style={{ marginBottom:18 }}><label className="label">Tags (comma separated)</label><input className="input" placeholder="math, biology, chapter-1" value={tags} onChange={e=>setTags(e.target.value)}/></div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>{loading?"Processing…":tab==="file"?"Upload & Extract":"Save Note"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  useEffect(() => { api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const del = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes(p => p.filter(n => n.id !== id));
    toast.success("Deleted");
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

  const extColor = n => ({ pdf:"#FF6363",docx:"#38B2FF",doc:"#38B2FF",pptx:"#FF6B9D",ppt:"#FF6B9D",xlsx:"#43E97B",xls:"#43E97B" })[n.originalName?.split(".").pop()?.toLowerCase()] || "var(--accent)";

  return (
    <div className="page" style={{ paddingTop:32 }}>
      {modal && <UploadModal onClose={()=>setModal(false)} onDone={n=>{setNotes(p=>[n,...p]);}}/>}
      <div className="flex-between" style={{ marginBottom:22,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontWeight:800,fontSize:"1.6rem",marginBottom:3 }}>My Notes</h1>
          <p style={{ color:"var(--text-secondary)",fontSize:"0.87rem" }}>{notes.length} note{notes.length!==1?"s":""}</p>
        </div>
        <button onClick={()=>setModal(true)} className="btn btn-primary"><Plus size={17}/> Add Note</button>
      </div>
      <div style={{ position:"relative",marginBottom:22 }}>
        <Search size={15} style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)" }}/>
        <input className="input" style={{ paddingLeft:40 }} placeholder="Search notes…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {loading ? (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16 }}>
          {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{ height:155,borderRadius:16 }}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="card" style={{ textAlign:"center",padding:60 }}>
          <FileText size={42} color="var(--text-muted)" style={{ margin:"0 auto 14px" }}/>
          <h3 style={{ fontWeight:700,marginBottom:8 }}>{search?"No results":"No notes yet"}</h3>
          <p style={{ color:"var(--text-muted)",fontSize:"0.87rem",marginBottom:22 }}>{search?"Try a different search":"Upload a document or write your first note"}</p>
          {!search && <button onClick={()=>setModal(true)} className="btn btn-primary btn-sm"><Plus size={14}/> Add Note</button>}
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16 }}>
          {filtered.map(n => (
            <Link key={n.id} to={`/notes/${n.id}`} className="card hover-lift" style={{ textDecoration:"none",display:"flex",flexDirection:"column" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
              <div className="flex-between" style={{ marginBottom:10 }}>
                <div style={{ width:38,height:38,background:`${extColor(n)}18`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {n.type==="file"?<File size={19} color={extColor(n)}/>:<FileText size={19} color="var(--accent)"/>}
                </div>
                <button onClick={e=>del(n.id,e)} className="btn btn-danger btn-icon" style={{ padding:6,opacity:0.5 }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
                  <Trash2 size={13}/>
                </button>
              </div>
              <div style={{ fontWeight:700,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.92rem" }}>{n.title}</div>
              <div style={{ color:"var(--text-muted)",fontSize:"0.78rem",flex:1,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",marginBottom:10 }}>{n.content?.slice(0,120)||"No preview"}</div>
              {n.tags?.length>0 && <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>{n.tags.slice(0,3).map(t=><span key={t} className="badge badge-accent" style={{ fontSize:"0.68rem" }}><Tag size={9}/>{t}</span>)}</div>}
              <div className="flex-between" style={{ borderTop:"1px solid var(--border-light)",paddingTop:8 }}>
                <span style={{ fontSize:"0.7rem",color:"var(--text-muted)",display:"flex",alignItems:"center",gap:3 }}><Clock size={10}/>{new Date(n.createdAt).toLocaleDateString()}</span>
                {n.flashcards?.length>0 && <span style={{ fontSize:"0.7rem",color:"var(--accent-2)",display:"flex",alignItems:"center",gap:3 }}><Layers size={10}/>{n.flashcards.length}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
