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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Copy, Check, Trash2, Briefcase, Activity, Send, Flame, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { MetricCard } from "@/components/metric-card";
import { ScoreBadge } from "@/components/score-badge";
import { PlatformBadge, TemplateBadge } from "@/components/platform-badge";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  public_token: string | null;
  template: string | null;
  score_cutoff: number | null;
  autopilot: boolean | null;
  created_at: string;
}

type PlatformId = "meta" | "tiktok" | "google_ads" | "kwai";

const PLATFORMS: Array<{ id: PlatformId; name: string; badgeKey: string; pixelLabel: string; tokenLabel: string }> = [
  { id: "meta", name: "Meta", badgeKey: "meta", pixelLabel: "Pixel ID", tokenLabel: "Token de Acesso" },
  { id: "tiktok", name: "TikTok", badgeKey: "tiktok", pixelLabel: "Pixel ID", tokenLabel: "Access Token" },
  { id: "google_ads", name: "Google Ads", badgeKey: "google", pixelLabel: "Tag ID", tokenLabel: "API Secret" },
  { id: "kwai", name: "Kwai for Business", badgeKey: "kwai", pixelLabel: "Pixel ID", tokenLabel: "Access Token" },
];

type TipoBase = "vsl" | "ecommerce" | "lead_quiz" | "local_x1";

const TIPOS_BASE: Array<{ id: TipoBase; label: string }> = [
  { id: "vsl", label: "VSL / Infoproduto" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "lead_quiz", label: "Captura de Leads / Quiz" },
  { id: "local_x1", label: "Negócio Local / WhatsApp" },
];

const ECOMMERCE_SUBS = [
  { id: "ecommerce_multi", label: "Loja virtual com múltiplos produtos", desc: "Várias páginas, categorias, galeria e avaliações" },
  { id: "ecommerce_single", label: "Página de venda com produto único", desc: "Landing page de um produto só com checkout" },
];

const QUIZ_SUBS = [
  { id: "lead_quiz_capture", label: "Apenas captura de lead", desc: "O quiz coleta o contato — sem venda no final" },
  { id: "lead_quiz_sale", label: "Quiz com venda", desc: "O quiz leva a um checkout e compra" },
];

function getTipoBase(template: string): TipoBase {
  if (template.startsWith("ecommerce")) return "ecommerce";
  if (template.startsWith("lead_quiz")) return "lead_quiz";
  if (template === "local_x1") return "local_x1";
  return "vsl";
}

interface CapiCred {
  pixel_id: string;
  vault_secret_id: string;
  is_active: boolean;
  showToken: boolean;
  loading: boolean;
}
const emptyCred = (): CapiCred => ({ pixel_id: "", vault_secret_id: "", is_active: false, showToken: false, loading: false });

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [copiedToken, setCopiedToken] = useState(false);
  const [savingAutopilot, setSavingAutopilot] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [editTemplate, setEditTemplate] = useState("");
  const [editTipoBase, setEditTipoBase] = useState<TipoBase>("vsl");
  const [editScoreCutoff, setEditScoreCutoff] = useState(60);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState("");

  const [creds, setCreds] = useState<Record<PlatformId, CapiCred>>({
    meta: emptyCred(), tiktok: emptyCred(), google_ads: emptyCred(), kwai: emptyCred(),
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).single();
      if (error) toast.error(error.message);
      else {
        setWorkspace(data as Workspace);
        setEditName(data.name);
        setEditDomain(data.domain);
        setEditTemplate(data.template ?? "vsl");
        setEditTipoBase(getTipoBase(data.template ?? "vsl"));
        setEditScoreCutoff(data.score_cutoff ?? 60);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!workspace) return;
    (async () => {
      const [sessRes, evRes, credsRes] = await Promise.all([
        supabase.from("active_sessions").select("*").eq("workspace_id", workspace.id).order("last_seen_at", { ascending: false }).limit(50),
        supabase.from("capi_events_log").select("*").eq("workspace_id", workspace.id).order("sent_at", { ascending: false }).limit(100),
        supabase.from("capi_credentials").select("platform, pixel_id, vault_secret_id, is_active").eq("workspace_id", workspace.id),
      ]);
      setSessions(sessRes.data ?? []);
      setEvents(evRes.data ?? []);
      if (credsRes.data) {
        setCreds((prev) => {
          const next = { ...prev };
          for (const row of credsRes.data as any[]) {
            if (next[row.platform as PlatformId]) {
              next[row.platform as PlatformId] = { ...next[row.platform as PlatformId], pixel_id: row.pixel_id ?? "", vault_secret_id: row.vault_secret_id ?? "", is_active: !!row.is_active };
            }
          }
          return next;
        });
      }
    })();
  }, [workspace]);

  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }, []);
  const sessionsToday = useMemo(() => sessions.filter((s) => new Date(s.created_at ?? s.last_seen_at ?? 0).getTime() >= todayStart), [sessions, todayStart]);
  const avgScore = useMemo(() => { const arr = sessionsToday.map((s) => Number(s.score) || 0); return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }, [sessionsToday]);
  const eventsToday = useMemo(() => events.filter((e) => new Date(e.sent_at ?? 0).getTime() >= todayStart), [events, todayStart]);
  const hotLeads = useMemo(() => sessionsToday.filter((s) => (Number(s.score) || 0) >= 85).length, [sessionsToday]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, number>();
    const cur = new Date(); cur.setHours(0, 0, 0, 0); cur.setDate(cur.getDate() - 6);
    for (let i = 0; i < 7; i++) { const k = cur.toISOString().slice(0, 10); buckets.set(k, 0); cur.setDate(cur.getDate() + 1); }
    for (const s of sessions) { const k = (s.created_at ?? s.last_seen_at ?? "").slice(0, 10); if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1); }
    return Array.from(buckets.entries()).map(([k, v]) => ({ date: k.slice(8, 10) + "/" + k.slice(5, 7), value: v }));
  }, [sessions]);

  const publicToken = workspace?.public_token ?? "";

  const copyToken = () => {
    if (!publicToken) return;
    navigator.clipboard.writeText(publicToken);
    setCopiedToken(true);
    toast.success("Token copiado!");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const updateCred = (p: PlatformId, patch: Partial<CapiCred>) => setCreds((prev) => ({ ...prev, [p]: { ...prev[p], ...patch } }));

  const saveCred = async (p: PlatformId) => {
    if (!workspace) return;
    const c = creds[p];
    updateCred(p, { loading: true });
    const { error } = await supabase.from("capi_credentials").upsert(
      { workspace_id: workspace.id, platform: p, pixel_id: c.pixel_id, vault_secret_id: c.vault_secret_id, is_active: true },
      { onConflict: "workspace_id,platform" }
    );
    updateCred(p, { loading: false, is_active: true });
    if (error) toast.error(error.message);
    else toast.success("Salvo!");
  };

  const toggleAutopilot = async (v: boolean) => {
    if (!workspace) return;
    setSavingAutopilot(true);
    const { error } = await supabase.from("workspaces").update({ autopilot: v }).eq("id", workspace.id);
    setSavingAutopilot(false);
    if (error) toast.error(error.message);
    else { setWorkspace({ ...workspace, autopilot: v }); toast.success("Atualizado"); }
  };

  const handleTipoBaseChange = (tipo: TipoBase) => {
    setEditTipoBase(tipo);
    if (tipo === "vsl") setEditTemplate("vsl");
    if (tipo === "local_x1") setEditTemplate("local_x1");
    if (tipo === "ecommerce") setEditTemplate("ecommerce_multi");
    if (tipo === "lead_quiz") setEditTemplate("lead_quiz_capture");
  };

  const handleSubTipoChange = (subTipo: string) => {
    if (subTipo !== workspace?.template) {
      setPendingTemplate(subTipo);
      setShowResetConfirm(true);
    } else {
      setEditTemplate(subTipo);
    }
  };

  const confirmTipoNegocioChange = () => {
    setEditTemplate(pendingTemplate);
    setShowResetConfirm(false);
  };

  const saveEdit = async () => {
    if (!workspace) return;
    setSavingEdit(true);
    const tipoChanged = editTemplate !== workspace.template;

    const { error } = await supabase.from("workspaces").update({
      name: editName, domain: editDomain, template: editTemplate, score_cutoff: editScoreCutoff,
    }).eq("id", workspace.id);

    if (error) { toast.error(error.message); setSavingEdit(false); return; }

    if (tipoChanged) {
      await supabase.from("capi_events_log").delete().eq("workspace_id", workspace.id);
      await supabase.from("active_sessions").delete().eq("workspace_id", workspace.id);
      toast.success("Workspace atualizado e dados resetados!");
    } else {
      toast.success("Workspace atualizado!");
    }

    setWorkspace({ ...workspace, name: editName, domain: editDomain, template: editTemplate, score_cutoff: editScoreCutoff });
    setSavingEdit(false);
    setEditing(false);
  };

  const deleteWorkspace = async () => {
    if (!workspace) return;
    await supabase.from("capi_events_log").delete().eq("workspace_id", workspace.id);
    await supabase.from("active_sessions").delete().eq("workspace_id", workspace.id);
    const { error } = await supabase.from("workspaces").delete().eq("id", workspace.id);
    if (error) toast.error(error.message);
    else { toast.success("Workspace excluído"); navigate("/workspaces"); }
  };

  if (loading) {
    return <Layout><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6366F1] border-t-transparent" /></div></Layout>;
  }

  if (!workspace) {
    return <Layout><p className="text-[#94A3B8]">Workspace não encontrado</p></Layout>;
  }

  return (
    <Layout>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
          <p className="text-[#94A3B8]">{workspace.domain}</p>
        </div>
        <div className="flex items-center gap-2">
          <TemplateBadge template={workspace.template ?? ""} />
          <span className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#10B981" }} />
            Ativo
          </span>
        </div>
      </header>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="bg-[#141415] border border-white/10">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="capi">Eventos CAPI</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="SESSÕES HOJE" value={sessionsToday.length.toLocaleString("pt-BR")} icon={Briefcase} />
            <MetricCard label="SCORE MÉDIO" value={avgScore.toFixed(1)} icon={Activity} />
            <MetricCard label="EVENTOS CAPI" value={eventsToday.length.toLocaleString("pt-BR")} icon={Send} />
            <MetricCard label="LEADS QUENTES (≥85)" value={hotLeads.toLocaleString("pt-BR")} icon={Flame} accent="success" />
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-[13px] font-medium text-[#94A3B8]">Sessões últimos 7 dias</CardTitle></CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wsAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A855F7" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="wsAuraLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="transparent" tick={{ fill: "#94A3B8", fontSize: 11 }} tickMargin={10} />
                    <YAxis stroke="transparent" tick={{ fill: "#94A3B8", fontSize: 11 }} allowDecimals={false} width={36} />
                    <Tooltip contentStyle={{ background: "#141415", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, color: "#F8FAFC", fontSize: 12 }} />
                    <Area type="monotone" dataKey="value" stroke="url(#wsAuraLine)" strokeWidth={2.5} dot={false} fill="url(#wsAreaFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-[13px] font-medium text-[#94A3B8]">Últimas sessões</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Tipo de negócio</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-[#94A3B8]">Nenhuma sessão registrada.</TableCell></TableRow>}
                  {sessions.map((s) => {
                    const isActive = s.last_seen_at && (Date.now() - new Date(s.last_seen_at).getTime()) < 5 * 60_000;
                    return (
                      <TableRow key={s.id}>
                        <TableCell><ScoreBadge score={Number(s.score) || 0} /></TableCell>
                        <TableCell><TemplateBadge template={s.template || workspace.template || ""} /></TableCell>
                        <TableCell><PlatformBadge platform={s.platform || s.source || ""} /></TableCell>
                        <TableCell className="tabular-nums text-[#94A3B8]">{s.last_seen_at ? new Date(s.last_seen_at).toLocaleString("pt-BR") : "—"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: isActive ? "#10B981" : "#94A3B8" }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#10B981" : "#94A3B8" }} />
                            {isActive ? "Ativo" : "Encerrado"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capi" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-[13px] font-medium text-[#94A3B8]">Eventos enviados</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Sucesso</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-[#94A3B8]">Nenhum evento registrado.</TableCell></TableRow>}
                  {events.map((e) => {
                    const ok = e.success === true;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="text-white">{e.event_name ?? e.type ?? "—"}</TableCell>
                        <TableCell><PlatformBadge platform={e.platform ?? ""} /></TableCell>
                        <TableCell>{typeof e.score === "number" ? <ScoreBadge score={Number(e.score)} /> : <span className="text-[#94A3B8]">—</span>}</TableCell>
                        <TableCell>
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs" style={{ background: ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: ok ? "#10B981" : "#EF4444" }}>
                            {ok ? "✓" : "✗"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#94A3B8]">{e.response_code ?? e.status_code ?? "—"}</TableCell>
                        <TableCell className="tabular-nums text-[#94A3B8]">{e.sent_at ? new Date(e.sent_at).toLocaleString("pt-BR") : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-white text-base">Token de instalação</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input readOnly value={publicToken} className="bg-[#1C1C1E] border-white/10 text-white font-mono text-sm" />
                <Button onClick={copyToken} className="bg-[#1C1C1E] border border-white/10 text-white hover:bg-[#26262a]">
                  {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Detalhes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="text-[#94A3B8] hover:text-white gap-2">
                {editing ? <><X className="h-4 w-4" /> Cancelar</> : <><Pencil className="h-4 w-4" /> Editar</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8] text-xs uppercase tracking-wider">Nome</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-[#1C1C1E] border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8] text-xs uppercase tracking-wider">Domínio</Label>
                      <Input value={editDomain} onChange={(e) => setEditDomain(e.target.value)} className="bg-[#1C1C1E] border-white/10 text-white" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[#94A3B8] text-xs uppercase tracking-wider">Tipo de negócio</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIPOS_BASE.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTipoBaseChange(t.id)}
                          className="rounded-lg border px-3 py-2 text-sm text-left transition-all"
                          style={{
                            background: editTipoBase === t.id ? "rgba(99,102,241,0.15)" : "#1C1C1E",
                            borderColor: editTipoBase === t.id ? "#6366F1" : "rgba(255,255,255,0.1)",
                            color: editTipoBase === t.id ? "#6366F1" : "#94A3B8",
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {editTipoBase === "ecommerce" && (
                      <div className="space-y-2">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Como é sua loja?</p>
                        {ECOMMERCE_SUBS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSubTipoChange(s.id)}
                            className="w-full rounded-lg p-3 text-left transition-all"
                            style={{
                              background: editTemplate === s.id ? "rgba(16,185,129,0.08)" : "#1C1C1E",
                              border: editTemplate === s.id ? "2px solid #10B981" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <p className="text-sm font-semibold text-white">{s.label}</p>
                            <p className="mt-0.5 text-xs text-[#94A3B8]">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {editTipoBase === "lead_quiz" && (
                      <div className="space-y-2">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Seu quiz leva a uma venda?</p>
                        {QUIZ_SUBS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSubTipoChange(s.id)}
                            className="w-full rounded-lg p-3 text-left transition-all"
                            style={{
                              background: editTemplate === s.id ? "rgba(245,158,11,0.08)" : "#1C1C1E",
                              border: editTemplate === s.id ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            <p className="text-sm font-semibold text-white">{s.label}</p>
                            <p className="mt-0.5 text-xs text-[#94A3B8]">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#94A3B8] text-xs uppercase tracking-wider">Score de corte: {editScoreCutoff}pts</Label>
                    <input type="range" min={40} max={90} value={editScoreCutoff} onChange={(e) => setEditScoreCutoff(Number(e.target.value))} className="w-full accent-[#6366F1]" />
                  </div>

                  <Button onClick={saveEdit} disabled={savingEdit} className="w-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white">
                    {savingEdit ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Nome</p>
                    <p className="mt-1 text-white">{workspace.name}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Domínio</p>
                    <p className="mt-1 text-white">{workspace.domain}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Tipo de negócio</p>
                    <div className="mt-1"><TemplateBadge template={workspace.template ?? ""} /></div>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Score de corte</p>
                    <p className="mt-1 text-white tabular-nums">{workspace.score_cutoff ?? 60}pts</p>
                  </div>
                  <div className="flex items-center justify-between md:col-span-2 rounded-md border border-white/5 bg-[#1C1C1E]/60 px-3 py-2.5">
                    <div>
                      <p className="text-white text-sm font-medium">Autopilot</p>
                      <p className="text-xs text-[#94A3B8]">Envia eventos automaticamente quando score ≥ corte</p>
                    </div>
                    <Switch checked={!!workspace.autopilot} disabled={savingAutopilot} onCheckedChange={toggleAutopilot} />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs uppercase tracking-wider">Status</p>
                    <p className="mt-1 text-white">Ativo</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alterar o tipo de negócio vai resetar os dados</AlertDialogTitle>
                <AlertDialogDescription>
                  As sessões ativas foram calculadas com o tipo de negócio anterior e os dados não são comparáveis com o novo. Ao confirmar, todas as sessões e eventos serão apagados e o tracking começará do zero.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowResetConfirm(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmTipoNegocioChange} className="bg-[#6366F1] text-white">
                  Confirmar e resetar dados
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Plataformas de Anúncios</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PLATFORMS.map((p) => {
                const c = creds[p.id];
                return (
                  <Card key={p.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformBadge platform={p.badgeKey} />
                        <CardTitle className="text-white text-base">{p.name}</CardTitle>
                      </div>
                      {c.is_active && <span className="text-xs text-[#10B981]">Configurado</span>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-[#94A3B8] text-xs">{p.pixelLabel}</Label>
                        <Input value={c.pixel_id} onChange={(e) => updateCred(p.id, { pixel_id: e.target.value })} className="bg-[#1C1C1E] border-white/10 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#94A3B8] text-xs">{p.tokenLabel}</Label>
                        <Input type={c.showToken ? "text" : "password"} value={c.vault_secret_id} onChange={(e) => updateCred(p.id, { vault_secret_id: e.target.value })} className="bg-[#1C1C1E] border-white/10 text-white font-mono" />
                        <button type="button" onClick={() => updateCred(p.id, { showToken: !c.showToken })} className="text-xs text-[#6366F1] hover:underline">
                          {c.showToken ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
                      <Button onClick={() => saveCred(p.id)} disabled={c.loading} className="bg-primary text-white w-full">
                        {c.loading ? "Salvando..." : "Salvar"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card style={{ borderColor: "rgba(239,68,68,0.25)" }}>
            <CardHeader><CardTitle className="text-red-400 text-base">Zona de perigo</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-[#94A3B8] mb-3">A exclusão é permanente. Todos os dados associados serão removidos.</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir workspace</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir "{workspace.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita. Todos os dados serão permanentemente removidos.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteWorkspace} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
