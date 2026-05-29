import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, MousePointerClick, Eye, Briefcase, Inbox } from "lucide-react";
import {
  LineChart,
  Line,
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
  change: string;
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
        return;
      }

      const fromIso = range.from.toISOString();
      const toIso = range.to.toISOString();

      const [sessRes, evRes, highRes] = await Promise.all([
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
      ]);

      const sessRows = (sessRes.data ?? []) as Array<{ created_at: string; score: number | null }>;
      setSessions(sessRows);
      setSessionsCount(sessRows.length);
      const scored = sessRows.filter((s) => typeof s.score === "number");
      setAvgScore(scored.length ? scored.reduce((a, b) => a + (b.score ?? 0), 0) / scored.length : 0);
      setEventsCount(evRes.count ?? 0);
      setHighScoreCount(highRes.count ?? 0);
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
      change: "+0%",
      icon: Briefcase,
    },
    {
      label: "SCORE MÉDIO DAS SESSÕES",
      value: avgScore.toFixed(1),
      change: "+0%",
      icon: MousePointerClick,
    },
    {
      label: "EVENTOS ENVIADOS ÀS PLATAFORMAS",
      value: eventsCount.toLocaleString("pt-BR"),
      change: "+0%",
      icon: Users,
    },
    {
      label: "SCORE ≥ 85 (ALTA INTENÇÃO)",
      value: highScoreCount.toLocaleString("pt-BR"),
      change: "+0%",
      icon: Eye,
      valueColor: "#10b981",
    },
  ];

  const chartData = useMemo(() => buildChart(sessions, range), [sessions, range]);

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visão Geral</h1>
          <p className="text-muted-foreground">Métricas em tempo real do seu tráfego qualificado</p>
        </div>
        <Button onClick={() => navigate("/workspaces/new")}>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Novo Workspace
        </Button>
      </div>

      <div className="mt-4">
        <DateFilter value={range} onChange={setRange} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle
                  className="font-medium"
                  style={{
                    fontSize: "11px",
                    color: "#a0a0a0",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  style={metric.valueColor ? { color: metric.valueColor } : undefined}
                >
                  {loading ? "—" : metric.value}
                </div>
                <p className="text-xs text-muted-foreground">{metric.change} vs mês passado</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Sessões qualificadas — período selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
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
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">
            Últimas sessões qualificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Inbox className="h-10 w-10" style={{ color: "#a0a0a0" }} />
            <p className="mt-3 text-sm font-medium text-white">Nenhuma sessão ainda</p>
            <p className="mt-1 max-w-md text-xs" style={{ color: "#a0a0a0" }}>
              Instale o script AURA no seu site para começar a capturar sessões qualificadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
