import { NavLink } from "react-router-dom";
import { Brain, BookOpen, Activity, Upload, GitBranch, Info, Layers, Heart } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Brain, end: true },
  { to: "/findings", label: "Findings", icon: BookOpen },
  { to: "/atlas", label: "Atlas", icon: Activity },
  { to: "/score", label: "AD Score", icon: Upload },
  { to: "/classifier", label: "Classifier", icon: Layers },
  { to: "/disease", label: "Disease", icon: Heart },
  { to: "/lr", label: "L-R Explorer", icon: GitBranch },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-neuro-bg">
      <header className="border-b border-slate-800 bg-neuro-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-400">
              NeuroVision Neuro
            </p>
            <h1 className="text-lg font-semibold text-white">
              AD-Associated Astrocyte Atlas
            </h1>
          </div>
          <nav className="flex flex-wrap gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
