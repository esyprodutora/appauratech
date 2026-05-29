import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const CDN_URL = "https://iynykpijbctbyhoaiyen.supabase.co/storage/v1/object/public/cdn/track.js";

interface WorkspaceLite {
  id: string;
  name: string;
  token: string | null;
  template: string | null;
}

export default function InstallScript() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("workspace");
  const [workspaces, setWorkspaces] = useState<WorkspaceLite[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("workspaces")
        .select("id, name, token, template")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const list = (data ?? []) as WorkspaceLite[];
      setWorkspaces(list);
      if (!selectedId && list.length > 0) setSelectedId(list[0].id);
      setLoading(false);
    })();
  }, [user]);

  const selected = workspaces.find((w) => w.id === selectedId) ?? null;
  const token = selected?.token ?? "TOKEN_DO_WORKSPACE";
  const template = selected?.template ?? "TEMPLATE_DO_WORKSPACE";

  const scriptCode = `<script\n  src="${CDN_URL}?token=${token}"\n  data-template="${template}"\n  async>\n</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white">Instalar Script</h1>
      <p className="text-[#94A3B8]">
        Cole o código no &lt;head&gt; do seu site para começar a rastrear.
      </p>

      <div className="mt-6 max-w-3xl space-y-5">
        <StepCard number={1} title="Cole o snippet antes do </head>" subtitle="Adicione o código abaixo dentro da tag <head> do seu site.">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-[#a0a0a0]">Workspace</Label>
              <Select
                value={selectedId ?? undefined}
                onValueChange={(v) => setSelectedId(v)}
                disabled={loading || workspaces.length === 0}
              >
                <SelectTrigger className="bg-[#1C1C1E] border-white/10 text-white">
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loading && workspaces.length === 0 && (
                <p className="text-sm text-[#a0a0a0]">
                  Crie um workspace primeiro para gerar o script.
                </p>
              )}
            </div>
            <pre
              className="rounded-md p-4 text-sm overflow-x-auto text-[#F8FAFC]"
              style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace" }}
            >
              <code>{scriptCode}</code>
            </pre>
            <Button onClick={copyToClipboard} className="btn-gradient text-white">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copiado" : "Copiar código"}
            </Button>
          </div>
        </StepCard>

        <StepCard number={2} title="Onde instalar">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { name: "WordPress", desc: "Plugin Insert Headers → cole no campo Header." },
              { name: "Shopify", desc: "Admin → Themes → Edit code → theme.liquid → antes de </head>." },
              { name: "HTML puro", desc: "Edite o seu index.html e cole antes da tag </head>." },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-lg p-4"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs" style={{ color: "#a0a0a0" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </StepCard>

        <StepCard number={3} title="Verificar instalação">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              className="bg-transparent text-white hover:bg-white/5"
              style={{ borderColor: "#ffffff" }}
            >
              Verificar instalação
            </Button>
            {selectedId && (
              <a
                href={`/workspaces/${selectedId}`}
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: "#7c3aed" }}
              >
                Ir para o workspace <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </StepCard>
      </div>
    </Layout>
  );
}

function StepCard({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#111111] border-[#2a2a2a]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "#7c3aed" }}
          >
            {number}
          </div>
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            {subtitle && (
              <p className="mt-1 text-sm" style={{ color: "#a0a0a0" }}>{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
