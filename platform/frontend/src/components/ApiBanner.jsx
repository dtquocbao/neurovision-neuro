import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { fetchHealth } from "../api/client";

export default function ApiBanner() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    fetchHealth()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("down"));
  }, []);

  if (status !== "down") return null;

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/50 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-start gap-2 text-sm text-amber-200">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          Backend API is not reachable. On Vercel, set{" "}
          <code className="rounded bg-slate-800 px-1">VITE_API_URL</code> to your Hugging Face
          Space URL (e.g.{" "}
          <code className="rounded bg-slate-800 px-1">
            https://rockydant-neurovision-neuro-api.hf.space
          </code>
          ) and redeploy. See <code className="rounded bg-slate-800 px-1">platform/DEPLOY.md</code>.
        </p>
      </div>
    </div>
  );
}
