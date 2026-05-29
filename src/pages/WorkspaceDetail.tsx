import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  pixel_id: string | null;
  status: string;
  created_at: string;
}

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchWorkspace();
  }, [id]);

  async function fetchWorkspace() {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      toast.error(error.message);
    } else {
      setWorkspace(data as Workspace);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!workspace) {
    return (
      <Layout>
        <p className="text-muted-foreground">Workspace não encontrado</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold">{workspace.name}</h1>
      <p className="text-muted-foreground">{workspace.domain}</p>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="capi">CAPI</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{workspace.status}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Pixel ID</p>
              <p className="text-lg font-semibold">{workspace.pixel_id ?? "Não configurado"}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="text-lg font-semibold">
                {new Date(workspace.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <p className="text-muted-foreground">Eventos serão exibidos aqui.</p>
        </TabsContent>

        <TabsContent value="capi" className="mt-4">
          <p className="text-muted-foreground">Configurações do CAPI serão exibidas aqui.</p>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <p className="text-muted-foreground">Configurações do workspace serão exibidas aqui.</p>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
