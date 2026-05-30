import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ensureOrganization } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Video, ShoppingCart, ClipboardList, MapPin } from "lucide-react";

type TipoBase = "vsl" | "ecommerce" | "lead_quiz" | "local_x1";
type TemplateId = "vsl" | "ecommerce_multi" | "ecommerce_single" | "lead_quiz_capture" | "lead_quiz_sale" | "local_x1";

const TIPOS_DE_NEGOCIO: Array<{ id: TipoBase; title: string; subtitle: string; icon: React.ReactNode }> = [
  { id: "vsl", title: "VSL / Infoproduto", subtitle: "Páginas de venda com vídeo", icon: <Video size={20} /> },
  { id: "ecommerce", title: "E-commerce", subtitle: "Loja virtual ou página de produto", icon: <ShoppingCart size={20} /> },
  { id: "lead_quiz", title: "Captura de Leads / Quiz", subtitle: "Funis de lead ou quiz", icon: <ClipboardList size={20} /> },
  { id: "local_x1", title: "Negócio Local / WhatsApp", subtitle: "Conversão por mensagem", icon: <MapPin size={20} /> },
];

const ECOMMERCE_SUBS = [
  { id: "ecommerce_multi", label: "Loja virtual com múltiplos produtos", desc: "Várias páginas, categorias, galeria de fotos e avaliações" },
  { id: "ecommerce_single", label: "Página de venda com produto único", desc: "Landing page de um produto só com checkout" },
];

const QUIZ_SUBS = [
  { id: "lead_quiz_capture", label: "Apenas captura de lead", desc: "O quiz coleta o contato — sem venda no final" },
  { id: "lead_quiz_sale", label: "Quiz com venda", desc: "O quiz leva a um checkout e compra" },
];

function scoreLabel(s: number) {
  if (s < 60) return "Agressivo";
  if (s < 75) return "Equilibrado — recomendado";
  return "Conservador";
}

function sanitizeDomain(raw: string) {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function genPublicToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function CreateWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [tipoBase, setTipoBase] = useState<TipoBase>("vsl");
  const [template, setTemplate] = useState<TemplateId>("vsl");
  const [score, setScore] = useState(60);
  const [autopilot, setAutopilot] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleTipoBase = (tipo: TipoBase) => {
    setTipoBase(tipo);
    if (tipo === "vsl") setTemplate("vsl");
    if (tipo === "local_x1") setTemplate("local_x1");
    if (tipo === "ecommerce") setTemplate("ecommerce_multi");
    if (tipo === "lead_quiz") setTemplate("lead_quiz_capture");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Você precisa estar logado");
    const cleanDomain = sanitizeDomain(domain);
    if (!cleanDomain) return toast.error("Informe um domínio válido");

    setIsLoading(true);
    try {
      const org = await ensureOrganization(user);
      const public_token = genPublicToken();
      const { data: ws, error } = await supabase
        .from("workspaces")
        .insert({
          org_id: org.id,
          name,
          domain: cleanDomain,
          template,
          score_cutoff: score,
          autopilot,
          public_token,
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Workspace criado!");
      navigate(`/install?workspace=${ws.id}`);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Erro ao criar workspace";
      toast.error(m);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white">Novo Workspace</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">

        <Card className="bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#94A3B8]">Nome do workspace</Label>
              <Input id="name" placeholder="Meu Workspace" value={name} onChange={(e) => setName(e.target.value)} required className="bg-[#1C1C1E] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-[#94A3B8]">Domínio (sem https, sem www)</Label>
              <Input id="domain" placeholder="meusite.com" value={domain} onChange={(e) => setDomain(e.target.value)} required className="bg-[#1C1C1E] border-white/10 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Tipo de negócio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {TIPOS_DE_NEGOCIO.map((t) => {
                const selected = t.id === tipoBase;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleTipoBase(t.id)}
                    className="rounded-lg p-4 text-left transition-colors"
                    style={
                      selected
                        ? { background: "rgba(124,58,237,0.08)", border: "2px solid #7c3aed" }
                        : { background: "#1a1a1a", border: "1px solid #2a2a2a" }
                    }
                  >
                    <div className="flex items-center gap-2 text-[#94A3B8]">{t.icon}</div>
                    <p className="mt-2 font-bold text-white">{t.title}</p>
                    <p className="mt-1 text-xs text-[#94A3B8]">{t.subtitle}</p>
                  </button>
                );
              })}
            </div>

            {/* Sub-tipo E-commerce */}
            {tipoBase === "ecommerce" && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Como é sua loja?</p>
                {ECOMMERCE_SUBS.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setTemplate(s.id as TemplateId)}
                    className="w-full rounded-lg p-3 text-left transition-colors"
                    style={
                      template === s.id
                        ? { background: "rgba(16,185,129,0.08)", border: "2px solid #10B981" }
                        : { background: "#1a1a1a", border: "1px solid #2a2a2a" }
                    }
                  >
                    <p className="text-sm font-semibold text-white">{s.label}</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{s.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Sub-tipo Lead Quiz */}
            {tipoBase === "lead_quiz" && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Seu quiz leva a uma venda?</p>
                {QUIZ_SUBS.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setTemplate(s.id as TemplateId)}
                    className="w-full rounded-lg p-3 text-left transition-colors"
                    style={
                      template === s.id
                        ? { background: "rgba(245,158,11,0.08)", border: "2px solid #F59E0B" }
                        : { background: "#1a1a1a", border: "1px solid #2a2a2a" }
                    }
                  >
                    <p className="text-sm font-semibold text-white">{s.label}</p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{s.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Score de corte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{score}</span>
              <span className="text-sm text-[#94A3B8]">{scoreLabel(score)}</span>
            </div>
            <Slider min={40} max={90} step={1} value={[score]} onValueChange={(v) => setScore(v[0])} />
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>40</span>
              <span>90</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141415] border-white/10">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-medium text-white">Autopilot</p>
              <p className="text-xs text-[#94A3B8]">Otimização automática com base no score de corte.</p>
            </div>
            <Switch checked={autopilot} onCheckedChange={setAutopilot} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="btn-gradient text-white">
            {isLoading ? "Criando..." : "Criar Workspace"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/workspaces")} className="bg-[#1C1C1E] border-white/10 text-white hover:bg-[#26262a]">
            Cancelar
          </Button>
        </div>
      </form>
    </Layout>
  );
}
