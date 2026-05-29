import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Radio } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  created_at: string;
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
        .select("id, name, domain, created_at")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false });
      if (!error && data) setWorkspaces(data as Workspace[]);
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
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{ws.name}</h3>
                  <p className="text-sm text-muted-foreground">{ws.domain}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  ativo
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link to={`/workspaces/${ws.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Ver
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
