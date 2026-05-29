import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  Code2,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Workspaces", path: "/workspaces", icon: Briefcase },
  { label: "Instalar Script", path: "/install", icon: Code2 },
  { label: "Planos", path: "/plans", icon: CreditCard },
  { label: "Configurações", path: "/settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex w-64 flex-col"
        style={{
          background: "#0A0A0B",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="p-4">
          <Link to="/" className="flex items-center">
            <span className="aura-logo" style={{ fontSize: "24px" }}>
              aura<span className="aura-logo-dot">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="aura-nav-item"
                    data-active={isActive}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-2 flex items-center gap-2 px-3 py-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#A855F7)" }}
            >
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: "#F8FAFC" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            style={{ color: "#94A3B8" }}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1" style={{ background: "#0A0A0B" }}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
