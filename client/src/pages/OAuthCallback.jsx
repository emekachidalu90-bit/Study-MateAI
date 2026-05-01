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
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const err   = searchParams.get("error");

    if (err) {
      const msgs = {
        google_failed:  "Google sign-in failed. Please try again.",
        github_failed:  "GitHub sign-in failed. Please try again.",
        discord_failed: "Discord sign-in failed. Please try again.",
      };
      setError(msgs[err] || "Social sign-in failed.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (!token) {
      setError("No authentication token received.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // Store token, fetch user, redirect to dashboard
    localStorage.setItem("sm_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    refreshUser()
      .then(data => {
        if (data) {
          toast.success(`Welcome${data.name ? `, ${data.name.split(" ")[0]}` : ""}! 🎉`);
          navigate("/dashboard", { replace: true });
        } else {
          throw new Error("Failed to load user");
        }
      })
      .catch(() => {
        localStorage.removeItem("sm_token");
        delete api.defaults.headers.common["Authorization"];
        setError("Failed to load your account. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      });
  }, []);

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, background:"var(--bg-primary)" }}>
      <div style={{ width:60, height:60, background:"rgba(255,99,99,0.1)", border:"1px solid rgba(255,99,99,0.2)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <AlertCircle size={30} color="#FF6363" />
      </div>
      <h2 style={{ fontWeight:800, color:"#FF6363", fontSize:"1.2rem" }}>Sign-in Failed</h2>
      <p style={{ color:"var(--text-secondary)", textAlign:"center", maxWidth:320, lineHeight:1.6 }}>{error}</p>
      <p style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>Redirecting you back to login…</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20, background:"var(--bg-primary)" }}>
      {/* Animated logo */}
      <div style={{ position:"relative" }}>
        <div style={{ width:72, height:72, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(108,99,255,0.4)" }}>
          <BookOpen size={34} color="white" />
        </div>
        {/* Rotating ring */}
        <div style={{ position:"absolute", inset:-6, border:"3px solid transparent", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"var(--text-primary)", fontWeight:700, fontSize:"1rem", marginBottom:4 }}>Signing you in…</p>
        <p style={{ color:"var(--text-muted)", fontSize:"0.83rem" }}>Setting up your account</p>
      </div>
    </div>
  );
}
