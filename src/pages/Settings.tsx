import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const WEBHOOK_BASE =
  "https://iynykpijbctbyhoaiyen.supabase.co/functions/v1/webhook-payment";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookToken, setWebhookToken] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    setWebhookToken(user.id);
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

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white">Configurações</h1>

      <div className="mt-6 grid gap-6">
        {/* Dados da conta */}
        <Card className="max-w-2xl bg-[#141415] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#a0a0a0]">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-[#1C1C1E] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#a0a0a0]">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    readOnly
                    className="bg-[#1C1C1E] border-white/10 text-white"
                  />
                </div>
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
            <Label className="text-[#a0a0a0]">URL do webhook</Label>
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
            <p className="mt-2 text-xs" style={{ color: "#a0a0a0" }}>
              Configure essa URL na sua plataforma de pagamentos para receber atualizações.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
