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

const navSections = [
  {
    label: "Workspace",
    items: [
      { label: "Visão Geral", path: "/", icon: Home },
      { label: "Workspaces", path: "/workspaces", icon: Radio },
      { label: "Instalação", path: "/install", icon: Code },
    ],
  },
  {
    label: "Conta",
    items: [
      { label: "Planos", path: "/plans", icon: CreditCard },
      { label: "Configurações", path: "/settings", icon: Settings },
    ],
  },
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
        className="flex w-60 flex-col"
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <div className="px-4 pb-3 pt-5">
          <Link to="/" className="flex items-center gap-2">
            <AuraLogo size={24} fontSize={22} />
          </Link>
        </div>

        <nav className="flex-1 px-2.5 pb-3">
          {navSections.map((section, idx) => (
            <div key={section.label}>
              <p
                className="aura-nav-section"
                style={idx === 0 ? { marginTop: "0.5rem" } : undefined}
              >
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="aura-nav-item"
                        data-active={isActive}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className="p-2.5"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          <div
            className="mb-1 flex items-center gap-2.5 rounded-md px-2 py-2"
            style={{ background: "transparent" }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[12.5px] font-medium leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                {user?.email}
              </p>
              <p
                className="truncate text-[11px] leading-tight"
                style={{ color: "var(--subtle-foreground)" }}
              >
                Plano Starter
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[13px] font-medium hover:bg-white/5 hover:text-foreground"
            style={{ color: "var(--subtle-foreground)" }}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-[15px] w-[15px]" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1" style={{ background: "var(--background)" }}>
        <div className="mx-auto max-w-[1200px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
