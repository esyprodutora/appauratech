import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  status: string;
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
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setWorkspaces(data as Workspace[]);
    }
    setLoading(false);
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
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Button onClick={() => navigate("/workspaces/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-muted-foreground">Nenhum workspace encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/workspaces/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Workspace
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
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    ws.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ws.status}
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
