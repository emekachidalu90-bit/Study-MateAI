import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { BookOpen, AlertCircle } from "lucide-react";

/**
 * This page handles two scenarios:
 *
 * 1. POPUP flow (normal) — the popup's postMessage already delivered the token
 *    to the parent window. This page is only briefly visible inside the popup
 *    before it auto-closes. Nothing to do here except show a spinner.
 *
 * 2. FALLBACK / DIRECT flow — user navigated here directly (no opener).
 *    Read the token from localStorage (set by the server's inline HTML),
 *    call /auth/me, and redirect to dashboard.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const ready = searchParams.get("ready");
    const err   = searchParams.get("error");

    const ERROR_MSGS = {
      google_failed:          "Google sign-in failed. Please try again.",
      github_failed:          "GitHub sign-in failed. Please try again.",
      discord_failed:         "Discord sign-in failed. Please try again.",
      oauth_failed:           "Social sign-in failed. Please try again.",
      google_not_configured:  "Google sign-in isn't set up on this server.",
      storage_blocked:        "Browser blocked session storage — check privacy settings.",
    };

    // ── Error from server ──
    if (err) {
      const msg = ERROR_MSGS[err] || "Sign-in failed.";
      // If we're in a popup, send error to parent and close
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "OAUTH_ERROR", error: msg }, "*");
        window.close();
        return;
      }
      setError(msg);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    // ── Popup flow: if we have an opener, the postMessage was already sent ──
    // by the server's inline HTML. Just close this popup window.
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    // ── Fallback / direct navigation: no opener ──
    if (ready === "1") {
      const token = localStorage.getItem("sm_token");
      if (!token) {
        setError("Session token missing. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      refreshUser()
        .then(user => {
          if (user) {
            toast.success(`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}! 🎉`);
            navigate("/dashboard", { replace: true });
          } else throw new Error("no user");
        })
        .catch(() => {
          localStorage.removeItem("sm_token");
          delete api.defaults.headers.common["Authorization"];
          setError("Failed to load your account. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
        });
      return;
    }

    // ── Nothing matched ──
    setError("Unexpected sign-in state. Please try again.");
    setTimeout(() => navigate("/login"), 3000);
  }, []);

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, background:"var(--bg-primary)" }}>
      <div style={{ width:60, height:60, background:"rgba(255,99,99,0.1)", border:"1px solid rgba(255,99,99,0.2)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <AlertCircle size={30} color="#FF6363"/>
      </div>
      <h2 style={{ fontWeight:800, color:"#FF6363", fontSize:"1.2rem" }}>Sign-in Failed</h2>
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
