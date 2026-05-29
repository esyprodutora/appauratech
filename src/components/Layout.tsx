import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Radio, Code, CreditCard, Settings, LogOut } from "lucide-react";
import AuraLogo from "@/components/AuraLogo";

const NAV = [
  { label: "Visão Geral", path: "/", icon: Home },
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
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

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
        <div style={{ padding: 24 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AuraLogo size={24} fontSize={22} />
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
          <ul style={{ display: "flex", flexDirection: "column", gap: 2, listStyle: "none", margin: 0, padding: 0 }}>
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
                      padding: "10px 16px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: active ? "#FFFFFF" : "#94A3B8",
                      background: active ? "#1a1040" : "transparent",
                      borderLeft: active ? "3px solid #6366F1" : "3px solid transparent",
                      textDecoration: "none",
                      transition: "background 150ms ease, color 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.color = "#F8FAFC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                      }
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: 12, borderTop: SIDEBAR_BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366F1, #A855F7)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: "#F8FAFC",
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
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              marginTop: 4,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#94A3B8",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#94A3B8";
            }}
          >
            <LogOut size={15} />
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
