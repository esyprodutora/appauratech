import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
  const [workspacesCount, setWorkspacesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    fetchMetrics();
  }, [user, authLoading, navigate]);

  async function fetchMetrics() {
    setLoading(true);
    const [wsResult, evResult] = await Promise.all([
      supabase.from("workspaces").select("id", { count: "exact", head: true }).eq("user_id", user?.id),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", user?.id),
    ]);
    setWorkspacesCount(wsResult.count ?? 0);
    setEventsCount(evResult.count ?? 0);
    setLoading(false);
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
      label: "SESSÕES QUALIFICADAS HOJE",
      value: workspacesCount.toLocaleString("pt-BR"),
      change: "+0%",
      icon: Briefcase,
    },
    {
      label: "SCORE MÉDIO DAS SESSÕES",
      value: "0.0",
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
      value: "0",
      change: "+0%",
      icon: Eye,
      valueColor: "#10b981",
    },
  ];

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: 0,
    };
  });

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
            Sessões qualificadas — últimos 7 dias
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
