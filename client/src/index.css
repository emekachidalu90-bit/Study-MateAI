@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg-primary: #0F0F1A;
  --bg-secondary: #16162A;
  --bg-card: #1E1E35;
  --bg-hover: #252540;
  --border: rgba(108,99,255,0.2);
  --border-light: rgba(255,255,255,0.06);
  --accent: #6C63FF;
  --accent-2: #FF6B9D;
  --accent-3: #43E97B;
  --accent-4: #F7C948;
  --accent-5: #38B2FF;
  --text-primary: #F0F0FF;
  --text-secondary: #9090B8;
  --text-muted: #5A5A85;
  --radius: 16px;
  --radius-sm: 10px;
  --radius-lg: 24px;
  --font: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; -webkit-tap-highlight-color: transparent; }
body { font-family: var(--font); background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
#root { min-height: 100vh; display: flex; flex-direction: column; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }
::selection { background: rgba(108,99,255,0.35); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Buttons */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 20px; border-radius:var(--radius-sm); border:none; font-family:var(--font); font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; white-space:nowrap; text-decoration:none; }
.btn:disabled { opacity:0.5; cursor:not-allowed; }
.btn-primary { background:var(--accent); color:#fff; }
.btn-primary:hover:not(:disabled) { background:#7B74FF; transform:translateY(-1px); box-shadow:0 8px 24px rgba(108,99,255,0.4); }
.btn-secondary { background:var(--bg-card); color:var(--text-primary); border:1px solid var(--border-light); }
.btn-secondary:hover:not(:disabled) { background:var(--bg-hover); border-color:var(--accent); }
.btn-danger { background:rgba(255,99,99,0.12); color:#FF6363; border:1px solid rgba(255,99,99,0.2); }
.btn-danger:hover:not(:disabled) { background:rgba(255,99,99,0.22); }
.btn-success { background:rgba(67,233,123,0.12); color:var(--accent-3); border:1px solid rgba(67,233,123,0.2); }
.btn-success:hover:not(:disabled) { background:rgba(67,233,123,0.22); }
.btn-lg { padding:14px 28px; font-size:1rem; border-radius:var(--radius); }
.btn-sm { padding:7px 14px; font-size:0.8rem; border-radius:8px; }
.btn-icon { padding:9px; border-radius:var(--radius-sm); }
.w-full { width:100%; }

/* Cards */
.card { background:var(--bg-card); border:1px solid var(--border-light); border-radius:var(--radius); padding:20px; transition:border-color 0.2s; }
.card:hover { border-color:var(--border); }
.hover-lift { transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
.hover-lift:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.35); }

/* Inputs */
.input { width:100%; padding:12px 16px; background:var(--bg-secondary); border:1px solid var(--border-light); border-radius:var(--radius-sm); color:var(--text-primary); font-family:var(--font); font-size:0.9rem; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
.input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(108,99,255,0.15); }
.input::placeholder { color:var(--text-muted); }
textarea.input { resize:vertical; min-height:100px; line-height:1.6; }
select.input { cursor:pointer; }
.label { display:block; font-size:0.78rem; font-weight:700; color:var(--text-secondary); margin-bottom:6px; letter-spacing:0.04em; text-transform:uppercase; }

/* Badges */
.badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:99px; font-size:0.75rem; font-weight:600; }
.badge-accent { background:rgba(108,99,255,0.15); color:var(--accent); }
.badge-green  { background:rgba(67,233,123,0.15); color:var(--accent-3); }
.badge-pink   { background:rgba(255,107,157,0.15); color:var(--accent-2); }
.badge-yellow { background:rgba(247,201,72,0.15);  color:var(--accent-4); }
.badge-blue   { background:rgba(56,178,255,0.15);  color:var(--accent-5); }

/* Progress */
.progress-bar { height:6px; background:var(--bg-secondary); border-radius:99px; overflow:hidden; }
.progress-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-2)); border-radius:99px; transition:width 0.4s ease; }

/* Layout */
.page { flex:1; padding:24px; max-width:1200px; margin:0 auto; width:100%; }
.flex-center { display:flex; align-items:center; justify-content:center; }
.flex-between { display:flex; align-items:center; justify-content:space-between; }
.flex-col { display:flex; flex-direction:column; }
.grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.gap-2{gap:8px} .gap-3{gap:12px} .gap-4{gap:16px} .gap-6{gap:24px}

/* Text */
.gradient-text { background:linear-gradient(135deg,var(--accent),var(--accent-2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.text-muted { color:var(--text-secondary); }
.text-accent { color:var(--accent); }
.text-sm { font-size:0.85rem; }
.text-xs { font-size:0.75rem; }
.truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Tabs */
.tabs { display:flex; gap:4px; background:var(--bg-secondary); padding:4px; border-radius:var(--radius-sm); }
.tab { flex:1; padding:8px 16px; border-radius:8px; border:none; background:transparent; color:var(--text-secondary); font-family:var(--font); font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
.tab.active { background:var(--bg-card); color:var(--text-primary); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
.tab:hover:not(.active) { color:var(--text-primary); }

/* Sidebar layout */
.app-layout { display:flex; min-height:100vh; }
.sidebar { width:240px; min-height:100vh; background:var(--bg-secondary); border-right:1px solid var(--border-light); display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; transition:transform 0.3s ease; }
.main-content { flex:1; margin-left:240px; min-height:100vh; display:flex; flex-direction:column; }

/* Modal */
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.15s ease; }
.modal { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:28px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,0.6); animation:bounceIn 0.3s ease; }

/* Flashcard */
.flashcard-scene { perspective:1000px; width:100%; max-width:580px; height:280px; cursor:pointer; }
.flashcard-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform 0.6s ease; }
.flashcard-inner.flipped { transform:rotateY(180deg); }
.flashcard-face { position:absolute; inset:0; backface-visibility:hidden; border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px; text-align:center; border:2px solid var(--border-light); }
.flashcard-front { background:linear-gradient(135deg,var(--bg-card),var(--bg-hover)); }
.flashcard-back { background:linear-gradient(135deg,rgba(108,99,255,0.1),rgba(255,107,157,0.08)); border-color:var(--accent); transform:rotateY(180deg); }

/* Leaderboard ranks */
.rank-1 { background:linear-gradient(135deg,rgba(247,201,72,0.12),rgba(247,201,72,0.04)); border-color:rgba(247,201,72,0.3)!important; }
.rank-2 { background:linear-gradient(135deg,rgba(192,192,192,0.08),rgba(192,192,192,0.02)); border-color:rgba(192,192,192,0.2)!important; }
.rank-3 { background:linear-gradient(135deg,rgba(205,127,50,0.08),rgba(205,127,50,0.02)); border-color:rgba(205,127,50,0.2)!important; }

/* Skeleton */
.skeleton { background:linear-gradient(90deg,var(--bg-card) 25%,var(--bg-hover) 50%,var(--bg-card) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:var(--radius-sm); }

/* Markdown */
.md h1,.md h2,.md h3 { color:var(--accent); font-weight:800; margin:18px 0 8px; }
.md h1{font-size:1.3rem} .md h2{font-size:1.1rem;border-bottom:1px solid var(--border-light);padding-bottom:6px} .md h3{font-size:0.97rem}
.md p { margin:8px 0; line-height:1.75; color:var(--text-secondary); }
.md ul,.md ol { padding-left:22px; margin:8px 0; }
.md li { margin:5px 0; color:var(--text-secondary); line-height:1.65; }
.md strong { color:var(--text-primary); font-weight:700; }
.md em { color:var(--accent-2); font-style:italic; }
.md code { background:var(--bg-secondary); padding:2px 7px; border-radius:5px; font-family:var(--font-mono); font-size:0.83em; color:var(--accent-2); }
.md pre { background:var(--bg-secondary); padding:16px; border-radius:var(--radius-sm); overflow-x:auto; margin:12px 0; }
.md blockquote { border-left:3px solid var(--accent); padding:6px 16px; margin:12px 0; color:var(--text-muted); font-style:italic; background:rgba(108,99,255,0.04); border-radius:0 8px 8px 0; }
.md table { width:100%; border-collapse:collapse; margin:12px 0; font-size:0.88rem; }
.md th { background:rgba(108,99,255,0.12); color:var(--accent); padding:8px 12px; text-align:left; font-weight:700; border:1px solid var(--border); }
.md td { padding:8px 12px; border:1px solid var(--border-light); color:var(--text-secondary); }

/* Animations */
@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes fadeIn    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes bounceIn  { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
@keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.9)} }
@keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.animate-fade    { animation:fadeIn 0.3s ease forwards; }
.animate-spin    { animation:spin 0.8s linear infinite; }
.animate-float   { animation:float 3s ease-in-out infinite; }
.glow-dot        { width:8px; height:8px; border-radius:50%; background:var(--accent-3); box-shadow:0 0 8px var(--accent-3); animation:pulse 2s infinite; }

/* Divider */
.divider { border:none; border-top:1px solid var(--border-light); margin:16px 0; }

/* Ring timer */
.ring-timer { width:56px; height:56px; position:relative; flex-shrink:0; }
.ring-timer svg { transform:rotate(-90deg); }
.ring-timer .track { fill:none; stroke:rgba(255,255,255,0.08); stroke-width:5; }
.ring-timer .fill  { fill:none; stroke:var(--accent); stroke-width:5; stroke-linecap:round; transition:stroke-dashoffset 1s linear, stroke 0.3s; }
.ring-timer .label { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.95rem; font-weight:800; }

/* Confetti */
@keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
.confetti-piece { position:fixed; top:-10px; animation:confetti-fall 3s ease-in forwards; pointer-events:none; z-index:9999; border-radius:2px; }

/* Responsive */
@media (max-width:768px) {
  .sidebar { transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main-content { margin-left:0; }
  .grid-2,.grid-3,.grid-4 { grid-template-columns:1fr; }
  .page { padding:16px; }
  .modal { padding:20px; }
  .hide-mobile { display:none!important; }
  .flashcard-scene { height:220px; }
}
