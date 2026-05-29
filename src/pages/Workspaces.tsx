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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seus Workspaces</h1>
          <p className="text-muted-foreground">Cada site monitorado é um workspace</p>
        </div>
        <Button onClick={() => navigate("/workspaces/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div
          className="mt-12 flex flex-col items-center justify-center rounded-xl p-12 text-center"
          style={{ background: "#111111", border: "1px solid #2a2a2a" }}
        >
          <Radio className="h-12 w-12" style={{ color: "#a0a0a0" }} />
          <h3 className="mt-4 text-lg font-semibold text-white">Nenhum workspace ainda</h3>
          <p className="mt-1 max-w-md text-sm" style={{ color: "#a0a0a0" }}>
            Crie seu primeiro workspace para começar a qualificar tráfego.
          </p>
          <Button className="btn-gradient mt-6 text-white" onClick={() => navigate("/workspaces/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar workspace
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="group cursor-pointer transition-all duration-200"
                style={{
                  background: "#111111",
                  border: "1px solid #2a2a2a",
                  borderRadius: 12,
                  padding: 24,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}>
                    {ws.name}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: "#052e16", color: "#10b981" }}
                  >
                    ativo
                  </span>
                </div>

                <p className="mt-2" style={{ color: "#a0a0a0", fontSize: 14 }}>
                  {ws.domain}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                    style={{ background: tpl.bg, color: tpl.color }}
                  >
                    {tpl.label}
                  </span>
                  <span style={{ color: "#a0a0a0", fontSize: 12 }}>
                    Score: {ws.score_cutoff ?? 60}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-1" style={{ color: "#a0a0a0", fontSize: 12 }}>
                  <span>{(ws.sessions7d ?? 0).toLocaleString("pt-BR")} sessões esta semana</span>
                  <span>
                    Criado em {new Date(ws.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <Link
                  to={`/workspaces/${ws.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-5 flex items-center justify-center gap-2 rounded-md text-sm font-medium text-white transition-all"
                  style={{
                    height: 40,
                    width: "100%",
                    background: "linear-gradient(135deg, #7c3aed 0%, #9f67f5 100%)",
                  }}
                >
                  Ver workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
