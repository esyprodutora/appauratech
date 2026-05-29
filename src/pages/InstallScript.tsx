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
import { Check, Copy } from "lucide-react";
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

      <Card className="mt-6 max-w-2xl bg-[#141415] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-[#94A3B8]">Selecione um workspace</Label>
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
              <p className="text-sm text-[#94A3B8]">
                Crie um workspace primeiro para gerar o script.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 max-w-2xl bg-[#141415] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Código de Instalação</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="bg-[#1C1C1E] border-white/10 text-white hover:bg-[#26262a]"
          >
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="rounded-md bg-[#0A0A0B] border border-white/5 p-4 text-sm overflow-x-auto text-[#F8FAFC]">
            <code>{scriptCode}</code>
          </pre>
        </CardContent>
      </Card>
    </Layout>
  );
}
