import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Radio, Code, CreditCard, Settings, LogOut } from "lucide-react";
import AuraLogo from "@/components/AuraLogo";

const NAV = [
  { label: "Visão Geral", path: "/dashboard", icon: Home },
  { label: "Workspaces", path: "/workspaces", icon: Radio },
  { label: "Instalação", path: "/install", icon: Code },
  { label: "Planos", path: "/plans", icon: CreditCard },
  { label: "Configurações", path: "/settings", icon: Settings },
];

const SIDEBAR_BORDER = "1px solid rgba(255,255,255,0.08)";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: "#0f0f0f",
          borderRight: SIDEBAR_BORDER,
          display: "flex",
          flexDirection: "column",
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px" }}>
          <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <AuraLogo size={24} fontSize={22} />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto" }}>
          <ul style={{ display: "flex", flexDirection: "column", gap: 1, listStyle: "none", margin: 0, padding: 0 }}>
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 14px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: active ? "#FFFFFF" : "#64748B",
                      background: active ? "rgba(99,102,241,0.12)" : "transparent",
                      borderLeft: active ? "2px solid #6366F1" : "2px solid transparent",
                      textDecoration: "none",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.color = "#CBD5E1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#64748B";
                      }
                    }}
                  >
                    <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 10px 14px", borderTop: SIDEBAR_BORDER }}>
          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366F1, #A855F7)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 0 2px rgba(99,102,241,0.25)",
              }}
            >
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#94A3B8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
              title={user?.email}
            >
              {user?.email}
            </p>
          </div>

          {/* Botão Sair */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "#64748B",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#EF4444";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#64748B";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            <LogOut size={14} strokeWidth={2} />
            Sair
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 240, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>{children}</div>
      </main>
    </div>
  );
}
