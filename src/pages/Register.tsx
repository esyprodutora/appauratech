import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Cadastro realizado! Verifique seu email.");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] px-4">
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "#141415", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-8 text-center">
          <h1 className="aura-logo" style={{ fontSize: "32px" }}>
            aura<span className="aura-logo-dot">.</span>
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: "#94A3B8" }}>
            Inteligência invisível. Resultado real.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: "#94A3B8" }}>Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="h-11 rounded-lg border-white/10 bg-[#1C1C1E] text-white placeholder:text-white/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: "#94A3B8" }}>Senha</Label>
            <Input id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="h-11 rounded-lg border-white/10 bg-[#1C1C1E] text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: "#94A3B8" }}>Confirmar Senha</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} required
              className="h-11 rounded-lg border-white/10 bg-[#1C1C1E] text-white" />
          </div>
          <Button type="submit" disabled={isLoading}
            className="btn-gradient h-11 w-full rounded-lg text-[15px] font-semibold">
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "#6366F1" }} className="font-medium hover:underline">
            Entre
          </Link>
        </p>
      </div>
    </div>
  );
}
