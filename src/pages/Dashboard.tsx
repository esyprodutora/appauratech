import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, Eye, Briefcase, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { ScoreBadge } from "@/components/score-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DateFilter, { DateRange, computeRange } from "@/components/DateFilter";

function buildChart(
  rows: Array<{ created_at: string; score: number | null }>,
  range: DateRange
) {
  const byHour = range.preset === "today" || range.preset === "yesterday";
  const buckets = new Map<string, number>();
  const start = new Date(range.from);
  const end = new Date(range.to);
  if (byHour) {
    const cur = new Date(start); cur.setMinutes(0, 0, 0);
    while (cur <= end) {
      buckets.set(cur.toISOString().slice(0, 13), 0);
      cur.setHours(cur.getHours() + 1);
    }
  } else {
    const cur = new Date(start); cur.setHours(0, 0, 0, 0);
    while (cur <= end) {
      buckets.set(cur.toISOString().slice(0, 10), 0);
      cur.setDate(cur.getDate() + 1);
    }
  }
  for (const r of rows) {
    const k = byHour ? r.created_at.slice(0, 13) : r.created_at.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([k, v]) => ({
    date: byHour ? k.slice(11) + "h" : k.slice(8, 10) + "/" + k.slice(5, 7),
    value: v,
  }));
}

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "default" | "success";
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState<DateRange>(() => computeRange("7d"));
  const [sessionsCount, setSessionsCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [highScoreCount, setHighScoreCount] = useState(0);
  const [sessions, setSessions] = useState<Array<{ created_at: string; score: number | null }>>([]);
  const [latestSessions, setLatestSessions] = useState<
    Array<{ id: string; score: number | null; last_seen_at: string | null; created_at: string | null; workspace_id: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate, range.from.getTime(), range.to.getTime()]);

  async function fetchMetrics() {
    setLoading(true);
    try {
      if (!user) return;
      const org = await ensureOrganization(user);
      const { data: wsRows } = await supabase
        .from("workspaces")
        .select("id")
        .eq("org_id", org.id);
      const workspaceIds = (wsRows ?? []).map((w) => w.id as string);

      if (workspaceIds.length === 0) {
        setSessionsCount(0);
        setAvgScore(0);
        setEventsCount(0);
        setHighScoreCount(0);
        setSessions([]);
        setLatestSessions([]);
        return;
      }

      const fromIso = range.from.toISOString();
      const toIso = range.to.toISOString();

      const [sessRes, evRes, highRes, latestRes] = await Promise.all([
        supabase
          .from("active_sessions")
          .select("created_at, score")
          .in("workspace_id", workspaceIds)
          .gte("created_at", fromIso)
          .lte("created_at", toIso),
        supabase
          .from("capi_events_log")
          .select("id", { count: "exact", head: true })
          .in("workspace_id", workspaceIds)
          .gte("sent_at", fromIso)
          .lte("sent_at", toIso),
        supabase
          .from("active_sessions")
          .select("id", { count: "exact", head: true })
          .in("workspace_id", workspaceIds)
          .gte("created_at", fromIso)
          .lte("created_at", toIso)
          .gte("score", 85),
        supabase
          .from("active_sessions")
          .select("id, score, last_seen_at, created_at, workspace_id")
          .in("workspace_id", workspaceIds)
          .order("last_seen_at", { ascending: false })
          .limit(50),
      ]);

      const sessRows = (sessRes.data ?? []) as Array<{ created_at: string; score: number | null }>;
      setSessions(sessRows);
      setSessionsCount(sessRows.length);
      const scored = sessRows.filter((s) => typeof s.score === "number");
      setAvgScore(scored.length ? scored.reduce((a, b) => a + (b.score ?? 0), 0) / scored.length : 0);
      setEventsCount(evRes.count ?? 0);
      setHighScoreCount(highRes.count ?? 0);
      setLatestSessions((latestRes.data ?? []) as typeof latestSessions);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => buildChart(sessions, range), [sessions, range]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const metrics: Metric[] = [
    {
      label: "SESSÕES QUALIFICADAS",
      value: sessionsCount.toLocaleString("pt-BR"),
      icon: Briefcase,
    },
    {
      label: "SCORE MÉDIO DAS SESSÕES",
      value: avgScore.toFixed(1),
      icon: MousePointerClick,
    },
    {
      label: "EVENTOS ENVIADOS ÀS PLATAFORMAS",
      value: eventsCount.toLocaleString("pt-BR"),
      icon: Users,
    },
    {
      label: "SCORE ≥ 85 (ALTA INTENÇÃO)",
      value: highScoreCount.toLocaleString("pt-BR"),
      icon: Eye,
      accent: "success",
    },
  ];

  return (
    <Layout>
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="aura-page-title">Visão Geral</h1>
          <p className="aura-page-subtitle">
            Métricas em tempo real do seu tráfego qualificado
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--subtle-foreground)" }}>
          <span className="aura-status-dot" /> Coletando ao vivo
        </div>
      </header>

      <div className="mt-5 border-b" style={{ borderColor: "var(--border)" }}>
        <DateFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={loading ? "—" : metric.value}
            icon={metric.icon}
            accent={metric.accent}
          />
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle
            className="font-medium"
            style={{ fontSize: 13, color: "var(--muted-foreground)", letterSpacing: "-0.005em" }}
          >
            Sessões qualificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="auraLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  tickMargin={10}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(168,85,247,0.4)", strokeWidth: 1, strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "#141415",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 10,
                    color: "#F8FAFC",
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  }}
                  labelStyle={{ color: "#94A3B8", marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#auraLine)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#141415", strokeWidth: 2, fill: "#A855F7" }}
                  fill="url(#dashAreaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle
              className="font-medium"
              style={{ fontSize: 13, color: "var(--muted-foreground)", letterSpacing: "-0.005em" }}
            >
              Últimas sessões qualificadas
            </CardTitle>
            <span className="text-[11px]" style={{ color: "var(--subtle-foreground)" }}>
              {latestSessions.length} sessões
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {latestSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(124,92,255,0.08)",
                  border: "1px solid rgba(124,92,255,0.18)",
                }}
              >
                <Inbox className="h-5 w-5" style={{ color: "var(--primary-glow)" }} />
              </div>
              <p className="mt-4 text-[14px] font-medium" style={{ color: "var(--foreground)" }}>
                Nenhuma sessão ainda
              </p>
              <p className="mt-1 max-w-md text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                Instale o script AURA no seu site para começar a capturar sessões qualificadas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Último evento</TableHead>
                  <TableHead>Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestSessions.map((s) => {
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <ScoreBadge score={s.score ?? 0} />
                      </TableCell>
                      <TableCell className="tabular-nums" style={{ color: "#94A3B8" }}>
                        {s.last_seen_at ? new Date(s.last_seen_at).toLocaleString("pt-BR") : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums" style={{ color: "#94A3B8" }}>
                        {s.created_at ? new Date(s.created_at).toLocaleString("pt-BR") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
