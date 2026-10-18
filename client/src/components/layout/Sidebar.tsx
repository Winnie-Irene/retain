import { NavLink } from "react-router-dom";
import { LayoutDashboard, LogOut, PiggyBank, ReceiptText, Shapes, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../utils/format";
import { Moon, Sprig, Sun } from "../ornaments/Ornaments";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const personalNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { to: "/expenses", label: "Expenses", icon: <ReceiptText size={18} /> },
  { to: "/budget", label: "Budget", icon: <PiggyBank size={18} /> },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Insights", icon: <Sparkles size={18} />, end: true },
  { to: "/admin/categories", label: "Categories", icon: <Shapes size={18} /> },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, isAdmin, signOut } = useAuth();

  const renderLinks = (items: NavItem[]) =>
    items.map((item) => (
      <li key={item.to}>
        <NavLink to={item.to} end={item.end} className="nav-link" onClick={onNavigate}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      </li>
    ));

  return (
    <aside className="sidebar">
      <div className="sidebar__crest">
        <div className="sidebar__sky">
          <Moon size={30} />
          <Sun size={48} />
        </div>
        <div className="sidebar__brand">
          <Sprig size={58} />
          <span className="script sidebar__wordmark">Retain</span>
          <Sprig size={58} flip />
        </div>
        <p className="sidebar__tagline">a monthly budget planner</p>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {isAdmin && (
          <>
            <p className="sidebar__group">Admin</p>
            <ul>{renderLinks(adminNav)}</ul>
          </>
        )}
        <p className="sidebar__group">{isAdmin ? "My money" : "Planner"}</p>
        <ul>{renderLinks(personalNav)}</ul>
      </nav>

      {user && (
        <div className="sidebar__user">
          <span className="avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div className="sidebar__who">
            <p className="sidebar__name">{user.name}</p>
            <p className="sidebar__role">{user.role === "admin" ? "Administrator" : user.email}</p>
          </div>
          <button type="button" className="sidebar__signout" onClick={signOut} aria-label="Sign out" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}