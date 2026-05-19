import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { BookOpen, AlertCircle } from "lucide-react";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const ready = searchParams.get("ready");
    const token = searchParams.get("token");
    const err   = searchParams.get("error");

    const ERRORS = {
      google_failed:          "Google sign-in failed. Please try again.",
      github_failed:          "GitHub sign-in failed. Please try again.",
      discord_failed:         "Discord sign-in failed. Please try again.",
      oauth_failed:           "Social sign-in failed. Please try again.",
      google_not_configured:  "Google sign-in is not set up on this server.",
      github_not_configured:  "GitHub sign-in is not set up on this server.",
      discord_not_configured: "Discord sign-in is not set up on this server.",
      storage_blocked:        "Couldn't save your session — check browser privacy settings.",
    };

    if (err) {
      setError(ERRORS[err] || "Sign-in failed.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    const useToken = async (t) => {
      localStorage.setItem("sm_token", t);
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      const user = await refreshUser();
      if (user) {
        toast.success(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}! 🎉`);
        navigate("/dashboard", { replace: true });
      } else {
        localStorage.removeItem("sm_token");
        delete api.defaults.headers.common["Authorization"];
        setError("Failed to load your account. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    // New flow: token already in localStorage, set by the inline HTML page
    if (ready === "1") {
      const stored = localStorage.getItem("sm_token");
      if (!stored) { setError("Token missing. Please try again."); setTimeout(() => navigate("/login"), 3000); return; }
      useToken(stored);
      return;
    }

    // Legacy: token in URL
    if (token) { useToken(token); return; }

    setError("No authentication data received.");
    setTimeout(() => navigate("/login"), 3000);
  }, []);

  if (error) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24,background:"var(--bg-primary)" }}>
      <div style={{ width:60,height:60,background:"rgba(255,99,99,0.1)",border:"1px solid rgba(255,99,99,0.2)",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <AlertCircle size={30} color="#FF6363"/>
      </div>
      <h2 style={{ fontWeight:800,color:"#FF6363" }}>Sign-in Failed</h2>
      <p style={{ color:"var(--text-secondary)",textAlign:"center",maxWidth:320,lineHeight:1.6 }}>{error}</p>
      <p style={{ color:"var(--text-muted)",fontSize:"0.82rem" }}>Redirecting to login…</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,background:"var(--bg-primary)" }}>
      <div style={{ position:"relative" }}>
        <div style={{ width:72,height:72,background:"linear-gradient(135deg,var(--accent),var(--accent-2))",borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(108,99,255,0.4)" }}>
          <BookOpen size={34} color="white"/>
        </div>
        <div style={{ position:"absolute",inset:-6,border:"3px solid transparent",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.9s linear infinite" }}/>
      </div>
      <p style={{ color:"var(--text-secondary)",fontWeight:600 }}>Signing you in…</p>
    </div>
  );
}
