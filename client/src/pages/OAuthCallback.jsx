import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { BookOpen, AlertCircle } from "lucide-react";

/**
 * Reads the OAuth result from the URL hash fragment:
 *   /oauth/callback#token=XXXX     → success
 *   /oauth/callback#error=XXXX     → failure
 *
 * Using the hash fragment (not query string) means the token
 * never gets sent to any server in a subsequent request and
 * never appears in server logs / referrer headers.
 *
 * This page works identically whether reached via a normal
 * browser redirect or an installed PWA's redirect — there is
 * only ever one window involved, so there's nothing to lose
 * track of.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const err    = params.get("error");

    const ERROR_MSGS = {
      google_failed:          "Google sign-in failed. Please try again.",
      github_failed:          "GitHub sign-in failed. Please try again.",
      discord_failed:         "Discord sign-in failed. Please try again.",
      oauth_failed:           "Social sign-in failed. Please try again.",
      google_not_configured:  "Google sign-in is not set up on this server.",
      github_not_configured:  "GitHub sign-in is not set up on this server.",
      discord_not_configured: "Discord sign-in is not set up on this server.",
    };

    if (err) {
      setError(ERROR_MSGS[err] || "Sign-in failed.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    if (!token) {
      setError("No sign-in data received. Please try again.");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
      return;
    }

    // Where to return to (saved before the redirect happened)
    let returnPath = "/dashboard";
    try {
      returnPath = sessionStorage.getItem("sm_oauth_return") || "/dashboard";
      sessionStorage.removeItem("sm_oauth_return");
    } catch (e) {}

    localStorage.setItem("sm_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    refreshUser()
      .then(user => {
        if (user) {
          toast.success(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}! 🎉`);
          navigate(returnPath === "/login" || returnPath === "/register" ? "/dashboard" : returnPath, { replace: true });
        } else {
          throw new Error("no user");
        }
      })
      .catch(() => {
        localStorage.removeItem("sm_token");
        delete api.defaults.headers.common["Authorization"];
        setError("Failed to load your account. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      });
  }, []);

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, background:"var(--bg-primary)" }}>
      <div style={{ width:60, height:60, background:"rgba(255,99,99,0.1)", border:"1px solid rgba(255,99,99,0.2)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <AlertCircle size={30} color="#FF6363"/>
      </div>
      <h2 style={{ fontWeight:800, color:"#FF6363" }}>Sign-in Failed</h2>
      <p style={{ color:"var(--text-secondary)", textAlign:"center", maxWidth:320, lineHeight:1.6 }}>{error}</p>
      <p style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>Redirecting to login…</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20, background:"var(--bg-primary)" }}>
      <div style={{ position:"relative" }}>
        <div style={{ width:72, height:72, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(108,99,255,0.4)" }}>
          <BookOpen size={34} color="white"/>
        </div>
        <div style={{ position:"absolute", inset:-6, border:"3px solid transparent", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.9s linear infinite" }}/>
      </div>
      <p style={{ color:"var(--text-secondary)", fontWeight:600 }}>Signing you in…</p>
    </div>
  );
}
