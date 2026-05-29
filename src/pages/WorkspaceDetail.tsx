import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  token: string | null;
  template: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

type PlatformId = "meta" | "tiktok" | "google_ads" | "kwai";
const PLATFORMS: Array<{ id: PlatformId; name: string }> = [
  { id: "meta", name: "Meta" },
  { id: "tiktok", name: "TikTok" },
  { id: "google_ads", name: "Google Ads" },
  { id: "kwai", name: "Kwai for Business" },
];

const CDN_URL = "https://iynykpijbctbyhoaiyen.supabase.co/storage/v1/object/public/cdn/track.js";

interface CapiCred {
  pixel_id: string;
  access_token: string;
  active: boolean;
  showToken: boolean;
  loading: boolean;
}
const emptyCred = (): CapiCred => ({
  pixel_id: "",
  access_token: "",
  active: false,
  showToken: false,
  loading: false,
});

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<Array<{ day: string; sessions: number }>>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [creds, setCreds] = useState<Record<PlatformId, CapiCred>>({
    meta: emptyCred(),
    tiktok: emptyCred(),
    google_ads: emptyCred(),
    kwai: emptyCred(),
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).single();
      if (error) toast.error(error.message);
      else setWorkspace(data as Workspace);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!workspace) return;
    (async () => {
      const [sessRes, evRes, credsRes] = await Promise.all([
        supabase
          .from("active_sessions")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("capi_events_log")
          .select("*")
          .eq("workspace_id", workspace.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("capi_credentials")
          .select("platform, pixel_id, access_token, active")
          .eq("workspace_id", workspace.id),
      ]);
      setSessions(sessRes.data ?? []);
      setEvents(evRes.data ?? []);

      // Build 7-day chart
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toISOString().slice(0, 10)] = 0;
      }
      for (const s of sessRes.data ?? []) {
        const k = (s.created_at ?? "").slice(0, 10);
        if (k in days) days[k]++;
      }
      setChartData(
        Object.entries(days).map(([day, sessions]) => ({
          day: day.slice(5),
          sessions,
        }))
      );

      if (credsRes.data) {
        setCreds((prev) => {
          const next = { ...prev };
          for (const row of credsRes.data as Array<{ platform: PlatformId; pixel_id: string; access_token: string; active: boolean }>) {
            if (next[row.platform]) {
              next[row.platform] = {
                ...next[row.platform],
                pixel_id: row.pixel_id ?? "",
                access_token: row.access_token ?? "",
                active: !!row.active,
              };
            }
          }
          return next;
        });
      }
    })();
  }, [workspace]);

  const sources = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of sessions) {
      const k = s.platform ?? s.source ?? "unknown";
      map[k] = (map[k] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  const scriptCode = workspace
    ? `<script\n  src="${CDN_URL}?token=${workspace.token ?? ""}"\n  data-template="${workspace.template ?? ""}"\n  async>\n</script>`
    : "";

  const copyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const updateCred = (p: PlatformId, patch: Partial<CapiCred>) =>
    setCreds((prev) => ({ ...prev, [p]: { ...prev[p], ...patch } }));

  const saveCred = async (p: PlatformId) => {
    if (!workspace) return;
    const c = creds[p];
    updateCred(p, { loading: true });
    const { error } = await supabase.from("capi_credentials").upsert(
      {
        workspace_id: workspace.id,
        user_id: workspace.user_id,
        platform: p,
        pixel_id: c.pixel_id,
        access_token: c.access_token,
        active: c.active,
      },
      { onConflict: "workspace_id,platform" }
    );
    updateCred(p, { loading: false });
    if (error) toast.error(error.message);
    else toast.success("Salvo!");
  };

  const deleteWorkspace = async () => {
    if (!workspace) return;
    if (!confirm(`Excluir workspace "${workspace.name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("workspaces").delete().eq("id", workspace.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Workspace excluído");
      navigate("/workspaces");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366F1] border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!workspace) {
    return (
      <Layout>
        <p className="text-[#94A3B8]">Workspace não encontrado</p>
      </Layout>
    );
  }

  const totalSessions = sessions.length;
  const totalEvents = events.length;
  const successEvents = events.filter((e) => e.status === "success" || e.status === "ok").length;
  const successRate = totalEvents ? Math.round((successEvents / totalEvents) * 100) : 0;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
      <p className="text-[#94A3B8]">{workspace.domain}</p>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-[#141415] border border-white/10">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="capi">Eventos CAPI</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Sessões (7d)", value: totalSessions },
              { label: "Eventos CAPI", value: totalEvents },
              { label: "Taxa sucesso", value: `${successRate}%` },
              { label: "Status", value: workspace.status },
            ].map((m) => (
              <Card key={m.label} className="bg-[#141415] border-white/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-[#94A3B8]">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white capitalize">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Sessões últimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1E" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#141415",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        color: "#F8FAFC",
                      }}
                    />
                    <Line type="monotone" dataKey="sessions" stroke="#6366F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessões */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Sessões ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sessão</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Página</TableHead>
                    <TableHead>Início</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-[#94A3B8]">
                        Nenhuma sessão registrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{String(s.id).slice(0, 8)}</TableCell>
                      <TableCell>{s.platform ?? s.source ?? "—"}</TableCell>
                      <TableCell className="truncate max-w-xs">{s.url ?? s.page ?? "—"}</TableCell>
                      <TableCell>{s.created_at ? new Date(s.created_at).toLocaleString("pt-BR") : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Fontes de tráfego</CardTitle>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">Sem dados.</p>
              ) : (
                <ul className="space-y-2">
                  {sources.map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between text-sm">
                      <span className="text-white capitalize">{k}</span>
                      <Badge variant="secondary">{v}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eventos CAPI */}
        <TabsContent value="capi" className="mt-4">
          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Eventos enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-[#94A3B8]">
                        Nenhum evento registrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {events.map((e) => {
                    const ok = e.status === "success" || e.status === "ok";
                    return (
                      <TableRow key={e.id}>
                        <TableCell>{e.event_name ?? e.type ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.platform ?? "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={ok ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                            {e.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>{e.created_at ? new Date(e.created_at).toLocaleString("pt-BR") : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Token de instalação</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-md bg-[#0A0A0B] border border-white/5 p-4 text-xs overflow-x-auto text-[#F8FAFC]">
                <code>{scriptCode}</code>
              </pre>
              <Button onClick={copyScript} className="mt-3 bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#26262a]">
                {copiedScript ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copiedScript ? "Copiado" : "Copiar"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#141415] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <p className="text-[#94A3B8]">Domínio</p>
                <p className="text-white">{workspace.domain}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Template</p>
                <p className="text-white">{workspace.template ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Status</p>
                <p className="text-white capitalize">{workspace.status}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Criado em</p>
                <p className="text-white">{new Date(workspace.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Plataformas de Anúncios</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PLATFORMS.map((p) => {
                const c = creds[p.id];
                return (
                  <Card key={p.id} className="bg-[#141415] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white">{p.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#94A3B8]">Ativo</span>
                        <Switch checked={c.active} onCheckedChange={(v) => updateCred(p.id, { active: v })} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-[#94A3B8] text-xs">Pixel ID</Label>
                        <Input
                          value={c.pixel_id}
                          onChange={(e) => updateCred(p.id, { pixel_id: e.target.value })}
                          className="bg-[#1C1C1E] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#94A3B8] text-xs">Token de Acesso</Label>
                        <Input
                          type={c.showToken ? "text" : "password"}
                          value={c.access_token}
                          onChange={(e) => updateCred(p.id, { access_token: e.target.value })}
                          className="bg-[#1C1C1E] border-white/10 text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => updateCred(p.id, { showToken: !c.showToken })}
                          className="text-xs text-[#6366F1] hover:underline"
                        >
                          {c.showToken ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
                      <Button
                        onClick={() => saveCred(p.id)}
                        disabled={c.loading}
                        className="btn-gradient text-white w-full"
                      >
                        {c.loading ? "Salvando..." : "Salvar"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="bg-[#141415] border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Zona de perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={deleteWorkspace}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
