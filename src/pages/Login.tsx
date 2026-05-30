import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
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
        style={{
          background: "#111111",
          borderColor: "#2a2a2a",
        }}
      >
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-white">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm" style={{ color: "#a0a0a0" }}>
            Acesse seu painel AURA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: "#94A3B8" }}>
              Email
            </Label>
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
            <Label htmlFor="password" style={{ color: "#94A3B8" }}>
              Senha
            </Label>
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
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-gradient h-11 w-full rounded-lg text-[15px] font-semibold"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "#94A3B8", fontSize: "12px" }}>ou</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="h-11 w-full rounded-lg text-[15px] font-semibold shadow-none hover:bg-[#222222] hover:text-white"
          style={{
            background: "#1a1a1a",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
          }}
        >
          <svg className="mr-2" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.84 2.078-1.786 2.717v2.258h2.908C16.658 14.2 17.64 11.873 17.64 9.2z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.481 18 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.167.282-1.71V4.958H.957A8.937 8.937 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.481 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </Button>

        <p className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
          Não tem conta?{" "}
          <Link
            to="/register"
            className="font-medium hover:underline"
            style={{
              background: "linear-gradient(90deg, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
