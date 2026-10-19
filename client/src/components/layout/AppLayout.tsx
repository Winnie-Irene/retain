import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Sun } from "../ornaments/Ornaments";
import { LoadingLines } from "../ui/Bits";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <div className={`shell ${menuOpen ? "shell--menu-open" : ""}`}>
      <header className="topbar">
        <div className="topbar__brand">
          <Sun size={28} />
          <span className="script">Retain</span>
        </div>
        <button
          type="button"
          className="topbar__menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div className="shell__sidebar">
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>
      {menuOpen && <div className="shell__scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <main className="shell__main" id="main">
        <div className="shell__content">
          <Suspense fallback={<LoadingLines rows={6} />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}