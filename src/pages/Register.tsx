import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] px-4 py-10">
      <div className="mb-6 flex flex-col items-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="#7c3aed" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="9" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
          <circle cx="16" cy="16" r="3" fill="#7c3aed" />
        </svg>
        <span className="mt-2 font-bold text-lg text-white">aura<span className="text-[#A855F7]">.</span></span>
        <p className="mt-1" style={{ color: "#a0a0a0", fontSize: "13px" }}>
          Inteligência invisível. Resultado real.
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "#111111", borderColor: "#2a2a2a" }}
      >
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-white">Criar conta grátis</h2>
          <p className="mt-1 text-sm" style={{ color: "#a0a0a0" }}>
            Comece a qualificar seu tráfego hoje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: "#94A3B8" }}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-[48px] rounded-lg border-white/10 bg-[#1C1C1E] px-4 py-3 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: "#94A3B8" }}>Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="min-h-[48px] rounded-lg border-white/10 bg-[#1C1C1E] px-4 py-3 pr-10 text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: "#94A3B8" }}>Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="min-h-[48px] rounded-lg border-white/10 bg-[#1C1C1E] px-4 py-3 pr-10 text-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-[15px] font-semibold text-white"
          >
            {isLoading ? "Cadastrando..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
          Já tem conta?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{
              background: "linear-gradient(90deg, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
