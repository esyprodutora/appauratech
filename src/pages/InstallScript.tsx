import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

const SCRIPT_URL = "https://cdn.aura.dev/aura-tracker.min.js";

export default function InstallScript() {
  const [copied, setCopied] = useState(false);

  const scriptCode = `<!-- AURA Tracking Script -->
<script src="${SCRIPT_URL}" data-workspace="SEU_WORKSPACE_ID" async></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Instalar Script</h1>
      <p className="text-muted-foreground">
        Cole o código abaixo no &lt;head&gt; do seu site para começar a rastrear.
      </p>

      <Card className="mt-6 max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Código de Instalação</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="rounded-md bg-muted p-4 text-sm overflow-x-auto">
            <code>{scriptCode}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-4 max-w-2xl">
        <CardHeader>
          <CardTitle>Guia Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Copie o código acima</p>
          <p>2. Acesse o painel do seu site (WordPress, Shopify, etc.)</p>
          <p>3. Cole o código no &lt;head&gt; de todas as páginas</p>
          <p>4. Substitua SEU_WORKSPACE_ID pelo ID do seu workspace</p>
          <p>5. Pronto! Os eventos começarão a ser rastreados</p>
        </CardContent>
      </Card>
    </Layout>
  );
}
