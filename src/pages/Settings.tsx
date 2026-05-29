import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const WEBHOOK_BASE =
  "https://iynykpijbctbyhoaiyen.supabase.co/functions/v1/webhook-payment";

type PlatformId = "meta" | "tiktok" | "google_ads" | "kwai";

interface PlatformConfig {
  id: PlatformId;
  name: string;
}

const PLATFORMS: PlatformConfig[] = [
  { id: "meta", name: "Meta" },
  { id: "tiktok", name: "TikTok" },
  { id: "google_ads", name: "Google Ads" },
  { id: "kwai", name: "Kwai for Business" },
];

interface PlatformState {
  pixel_id: string;
  access_token: string;
  active: boolean;
  loading: boolean;
  showToken: boolean;
}

const emptyPlatform = (): PlatformState => ({
  pixel_id: "",
  access_token: "",
  active: false,
  loading: false,
  showToken: false,
});

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookToken, setWebhookToken] = useState<string>("");
  const [platforms, setPlatforms] = useState<Record<PlatformId, PlatformState>>({
    meta: emptyPlatform(),
    tiktok: emptyPlatform(),
    google_ads: emptyPlatform(),
    kwai: emptyPlatform(),
  });

  useEffect(() => {
    if (!user) return;
    setWebhookToken(user.id);
    (async () => {
      const { data } = await supabase
        .from("capi_credentials")
        .select("platform, pixel_id, access_token, active")
        .eq("user_id", user.id);
      if (data) {
        setPlatforms((prev) => {
          const next = { ...prev };
          for (const row of data as Array<{ platform: PlatformId; pixel_id: string; access_token: string; active: boolean }>) {
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
  }, [user]);

  const webhookUrl = `${WEBHOOK_BASE}?token=${webhookToken}`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado!");
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const updatePlatform = (id: PlatformId, patch: Partial<PlatformState>) => {
    setPlatforms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const savePlatform = async (id: PlatformId) => {
    if (!user) return;
    const p = platforms[id];
    updatePlatform(id, { loading: true });
    const { error } = await supabase.from("capi_credentials").upsert(
      {
        user_id: user.id,
        platform: id,
        pixel_id: p.pixel_id,
        access_token: p.access_token,
        active: p.active,
      },
      { onConflict: "user_id,platform" }
    );
    updatePlatform(id, { loading: false });
    if (error) toast.error(error.message);
    else toast.success("Credenciais salvas!");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white">Configurações</h1>

      <div className="mt-6 grid gap-6">
        {/* Dados da conta */}
        <Card className="max-w-2xl bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Dados da conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#94A3B8]">Email</Label>
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  disabled
                  className="bg-[#1C1C1E] border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#94A3B8]">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-[#1C1C1E] border-white/10 text-white"
                />
              </div>
              <Button type="submit" disabled={savingProfile} className="btn-gradient text-white">
                {savingProfile ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Webhook de pagamento */}
        <Card className="max-w-2xl bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Webhook de pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-[#94A3B8]">URL do webhook</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-[#1C1C1E] border-white/10 text-white font-mono text-xs"
              />
              <Button
                variant="outline"
                onClick={copyWebhook}
                className="bg-[#1C1C1E] border-white/10 text-white hover:bg-[#26262a] shrink-0"
              >
                {copiedWebhook ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-xs text-[#94A3B8]">
              Configure essa URL na sua plataforma de pagamentos para receber atualizações.
            </p>
          </CardContent>
        </Card>

        {/* Plataformas de Anúncios */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">Plataformas de Anúncios</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PLATFORMS.map((p) => {
              const state = platforms[p.id];
              return (
                <Card key={p.id} className="bg-[#141415] border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">{p.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">Ativo</span>
                      <Switch
                        checked={state.active}
                        onCheckedChange={(v) => updatePlatform(p.id, { active: v })}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8] text-xs">Pixel ID</Label>
                      <Input
                        value={state.pixel_id}
                        onChange={(e) => updatePlatform(p.id, { pixel_id: e.target.value })}
                        className="bg-[#1C1C1E] border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#94A3B8] text-xs">Token de Acesso</Label>
                      <Input
                        type={state.showToken ? "text" : "password"}
                        value={state.access_token}
                        onChange={(e) => updatePlatform(p.id, { access_token: e.target.value })}
                        className="bg-[#1C1C1E] border-white/10 text-white font-mono"
                      />
                      <button
                        type="button"
                        className="text-xs text-[#6366F1] hover:underline"
                        onClick={() => updatePlatform(p.id, { showToken: !state.showToken })}
                      >
                        {state.showToken ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                    <Button
                      onClick={() => savePlatform(p.id)}
                      disabled={state.loading}
                      className="btn-gradient text-white w-full"
                    >
                      {state.loading ? "Salvando..." : "Salvar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
