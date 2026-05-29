import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from("workspaces").insert({
      user_id: user.id,
      name,
      domain,
      status: "active",
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Workspace criado com sucesso!");
      navigate("/workspaces");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Novo Workspace</h1>
      <Card className="mt-6 max-w-lg">
        <CardHeader>
          <CardTitle>Informações do Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Meu Workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                placeholder="https://meusite.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Workspace"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/workspaces")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
