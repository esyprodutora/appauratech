import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Plus, Radio, ArrowRight } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  template: string | null;
  score_cutoff: number | null;
  created_at: string;
  sessions7d?: number;
}

const TEMPLATE_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  vsl: { label: "VSL", bg: "rgba(124,58,237,0.15)", color: "#a78bfa" },
  ecommerce: { label: "E-commerce", bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  lead_quiz: { label: "Captura/Quiz", bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  local_x1: { label: "Negócio Local", bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
};

export default function Workspaces() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWorkspaces();
  }, [user, authLoading, navigate]);

  async function fetchWorkspaces() {
    setLoading(true);
    try {
      if (!user) return;
      const org = await ensureOrganization(user);
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, domain, template, score_cutoff, created_at")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const list = data as Workspace[];
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const withCounts = await Promise.all(
          list.map(async (ws) => {
            const { count } = await supabase
              .from("active_sessions")
              .select("id", { count: "exact", head: true })
              .eq("workspace_id", ws.id)
              .gte("created_at", since);
            return { ...ws, sessions7d: count ?? 0 };
          })
        );
        setWorkspaces(withCounts);
      }
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="aura-page-title">Workspaces</h1>
          <p className="aura-page-subtitle">Cada site monitorado é um workspace.</p>
        </div>
        <Button onClick={() => navigate("/workspaces/new")} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Workspace
        </Button>
      </header>

      {workspaces.length === 0 ? (
        <div
          className="mt-10 flex flex-col items-center justify-center rounded-xl p-14 text-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.18)" }}
          >
            <Radio className="h-5 w-5" style={{ color: "var(--primary-glow)" }} />
          </div>
          <h3 className="mt-4 text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>
            Nenhum workspace ainda
          </h3>
          <p className="mt-1 max-w-md text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            Crie seu primeiro workspace para começar a qualificar tráfego.
          </p>
          <Button className="btn-gradient mt-6 text-white" onClick={() => navigate("/workspaces/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar workspace
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => {
            const tpl = (ws.template && TEMPLATE_LABEL[ws.template]) || {
              label: ws.template ?? "Geral",
              bg: "rgba(255,255,255,0.08)",
              color: "#e5e7eb",
            };
            return (
              <div
                key={ws.id}
                onClick={() => navigate(`/workspaces/${ws.id}`)}
                className="aura-workspace-card group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className="truncate"
                      style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}
                    >
                      {ws.name}
                    </h3>
                    <p
                      className="mt-0.5 truncate"
                      style={{ color: "var(--subtle-foreground)", fontSize: 12.5 }}
                    >
                      {ws.domain}
                    </p>
                  </div>
                  <span className="aura-badge badge-score-high shrink-0">
                    <span className="aura-status-dot" />
                    ativo
                  </span>
                </div>

                <div
                  className="my-4 grid grid-cols-2 gap-3 rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <p className="metric-label" style={{ fontSize: 10.5 }}>Sessões 7d</p>
                    <p
                      className="tabular mt-1"
                      style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em" }}
                    >
                      {(ws.sessions7d ?? 0).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="metric-label" style={{ fontSize: 10.5 }}>Score de corte</p>
                    <p
                      className="tabular mt-1"
                      style={{ fontSize: 18, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em" }}
                    >
                      {ws.score_cutoff ?? 60}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className="aura-badge"
                    style={{ background: tpl.bg, color: tpl.color, borderColor: "transparent" }}
                  >
                    {tpl.label}
                  </span>
                  <Link
                    to={`/workspaces/${ws.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[12.5px] font-medium transition-colors group-hover:gap-1.5"
                    style={{ color: "var(--primary-glow)" }}
                  >
                    Ver workspace
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
