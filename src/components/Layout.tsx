import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Radio,
  Code,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuraLogo from "@/components/AuraLogo";

const navItems = [
  { label: "Visão Geral", path: "/", icon: Home },
  { label: "Workspaces", path: "/workspaces", icon: Radio },
  { label: "Instalação", path: "/install", icon: Code },
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
          background: "#0f0f0f",
          borderRight: "1px solid #1e1e1e",
        }}
      >
        <div className="p-4">
          <Link to="/" className="flex items-center">
            <AuraLogo size={24} fontSize={22} />
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
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                    style={{
                      background: isActive ? "#1a1040" : "transparent",
                      color: isActive ? "#ffffff" : "#a0a0a0",
                      borderLeft: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                      paddingLeft: isActive ? "9px" : "9px",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid #1e1e1e" }}>
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
            className="w-full justify-start hover:text-white"
            style={{ color: "#666", padding: "12px 16px" }}
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
