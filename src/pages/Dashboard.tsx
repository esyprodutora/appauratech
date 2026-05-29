import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, Eye, Briefcase, Inbox } from "lucide-react";
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
  icon: React.ElementType;
  valueColor?: string;
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
      valueColor: "#10b981",
    },
  ];

  const chartData = useMemo(() => buildChart(sessions, range), [sessions, range]);

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground">Métricas em tempo real do seu tráfego qualificado</p>
      </div>

      <div className="mt-3">
        <DateFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              style={{ background: "#111111", border: "1px solid #1e1e1e" }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle
                  className="font-medium"
                  style={{
                    fontSize: "11px",
                    color: "#555",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: metric.valueColor ?? "#ffffff",
                    lineHeight: 1.1,
                  }}
                >
                  {loading ? "—" : metric.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Sessões qualificadas — período selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal vertical={false} stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#a0a0a0" fontSize={12} />
                <YAxis stroke="#a0a0a0" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111111",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    color: "#F8FAFC",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                  fill="url(#dashAreaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6" style={{ background: "#111111", border: "1px solid #1e1e1e" }}>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Últimas sessões qualificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="h-10 w-10" style={{ color: "#a0a0a0" }} />
              <p className="mt-3 text-sm font-medium text-white">Nenhuma sessão ainda</p>
              <p className="mt-1 max-w-md text-xs" style={{ color: "#a0a0a0" }}>
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
                {latestSessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell
                      style={{
                        color: (s.score ?? 0) >= 85 ? "#10b981" : "#ffffff",
                        fontWeight: 600,
                      }}
                    >
                      {s.score ?? "—"}
                    </TableCell>
                    <TableCell>
                      {s.last_seen_at ? new Date(s.last_seen_at).toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell>
                      {s.created_at ? new Date(s.created_at).toLocaleString("pt-BR") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
