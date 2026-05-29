import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Plus, Radio, ArrowRight } from "lucide-react";
import { TemplateBadge } from "@/components/platform-badge";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  template: string | null;
  score_cutoff: number | null;
  created_at: string;
  sessions7d?: number;
  sessionsToday?: number;
  avgScore?: number;
}

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
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const withCounts = await Promise.all(
          list.map(async (ws) => {
            const [weekRes, todayRes, scoreRes] = await Promise.all([
              supabase
                .from("active_sessions")
                .select("id", { count: "exact", head: true })
                .eq("workspace_id", ws.id)
                .gte("created_at", since),
              supabase
                .from("active_sessions")
                .select("id", { count: "exact", head: true })
                .eq("workspace_id", ws.id)
                .gte("created_at", todayStart.toISOString()),
              supabase
                .from("active_sessions")
                .select("score")
                .eq("workspace_id", ws.id)
                .gte("created_at", since),
            ]);
            const scores = ((scoreRes.data ?? []) as Array<{ score: number | null }>).filter(
              (r) => typeof r.score === "number"
            );
            const avg = scores.length
              ? scores.reduce((a, b) => a + (b.score ?? 0), 0) / scores.length
              : 0;
            return {
              ...ws,
              sessions7d: weekRes.count ?? 0,
              sessionsToday: todayRes.count ?? 0,
              avgScore: avg,
            };
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
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => navigate(`/workspaces/${ws.id}`)}
              className="card-glow group cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#F8FAFC]">
                    {ws.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[12.5px] text-[#94A3B8]">
                    {ws.domain}
                  </p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    color: "#10B981",
                    borderColor: "rgba(16,185,129,0.18)",
                  }}
                >
                  <span
                    className="pulse-dot inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "#10B981" }}
                  />
                  Ativo
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <TemplateBadge template={ws.template ?? ""} />
                <span className="text-[11.5px] text-[#94A3B8]">
                  Corte: <span className="font-semibold text-[#F8FAFC] tabular-nums">{ws.score_cutoff ?? 60}pts</span>
                </span>
              </div>

              <div
                className="my-4 grid grid-cols-2 gap-3 rounded-lg p-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
              >
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                    Sessões hoje
                  </p>
                  <p className="mt-1 font-[Geist] text-[20px] font-bold tracking-[-0.02em] tabular-nums text-[#F8FAFC]">
                    {(ws.sessionsToday ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
                    Score médio
                  </p>
                  <p className="mt-1 font-[Geist] text-[20px] font-bold tracking-[-0.02em] tabular-nums text-[#F8FAFC]">
                    {(ws.avgScore ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>

              <Link
                to={`/workspaces/${ws.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gradient-brand inline-flex items-center gap-1 text-[12.5px] font-semibold transition-all group-hover:gap-1.5"
              >
                Ver detalhes
                <ArrowRight className="h-3.5 w-3.5 text-[#A855F7] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
