import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, MousePointerClick, Eye, Briefcase } from "lucide-react";

interface Metric {
  label: string;
  value: number;
  change: string;
  icon: React.ElementType;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workspacesCount, setWorkspacesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetchMetrics();
  }, [user, authLoading]);

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
      label: "Workspaces",
      value: workspacesCount,
      change: "+0%",
      icon: Briefcase,
    },
    {
      label: "Eventos Totais",
      value: eventsCount,
      change: "+0%",
      icon: MousePointerClick,
    },
    {
      label: "Visitantes",
      value: 0,
      change: "+0%",
      icon: Users,
    },
    {
      label: "Pageviews",
      value: 0,
      change: "+0%",
      icon: Eye,
    },
  ];

  const hasData = workspacesCount > 0 || eventsCount > 0;

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu tráfego</p>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : metric.value.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">{metric.change} vs mês passado</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hasData && !loading && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">Nenhum dado disponível ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um workspace e instale o script para começar a rastrear
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate("/workspaces/new")}>Criar Workspace</Button>
            <Button variant="outline" onClick={() => navigate("/install")}>
              Instalar Script
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
