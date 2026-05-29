import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type PlanId = "starter" | "growth" | "scale";

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "R$ 197",
    features: [
      "1 workspace",
      "50k sessões/mês",
      "1 plataforma",
      "2 templates",
      "Suporte por email",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "R$ 497",
    highlighted: true,
    features: [
      "3 workspaces",
      "300k sessões/mês",
      "Todas plataformas",
      "Todos templates",
      "CRM WhatsApp",
      "Identity Stitching",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "R$ 997",
    features: [
      "10 workspaces",
      "2M sessões/mês",
      "Modo Avançado",
      "Relatório de atribuição",
    ],
  },
];

const BILLING_URL =
  "https://iynykpijbctbyhoaiyen.supabase.co/functions/v1/stripe-billing";

export default function Plans() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      const { data: org } = await supabase
        .from("organizations")
        .select("plan")
        .single();
      if (org?.plan) setCurrentPlan(org.plan);
    };

    // Detecta retorno do Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const plan = params.get("plan");
      if (plan) setCurrentPlan(plan);
      toast.success("Plano ativado com sucesso!");
      window.history.replaceState({}, "", window.location.pathname);
    }

    fetchCurrentPlan();
  }, []);

  const handleCheckout = async (planId: PlanId) => {
    if (currentPlan === planId) return;
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(BILLING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          action: "create-checkout",
          plan: planId,
          return_url: window.location.origin + "/plano",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao iniciar checkout");
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isActivePlan = (planId: PlanId) => currentPlan === planId;

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Planos</h1>
        <p className="mt-2 text-[#94A3B8]">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isLoading = loadingPlan === plan.id;
          const isActive = isActivePlan(plan.id);

          const card = (
            <div className="flex h-full flex-col rounded-2xl bg-[#141415] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="rounded-full bg-[rgba(16,185,129,0.15)] px-2.5 py-0.5 text-xs font-medium text-[#10B981] border border-[rgba(16,185,129,0.3)]">
                      Plano atual
                    </span>
                  )}
                  {plan.highlighted && !isActive && (
                    <span className="rounded-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-2.5 py-0.5 text-xs font-medium text-white">
                      Mais popular
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-[#94A3B8]">/mês</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-[#10B981]" : "text-[#6366F1]"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-6 w-full ${
                  isActive
                    ? "bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] cursor-default hover:bg-[rgba(16,185,129,0.15)]"
                    : plan.highlighted
                    ? "btn-gradient text-white"
                    : "bg-[#1C1C1E] text-white hover:bg-[#26262a] border border-white/10"
                }`}
                onClick={() => !isActive && handleCheckout(plan.id)}
                disabled={isLoading || isActive}
              >
                {isActive ? "✓ Plano ativo" : isLoading ? "Redirecionando..." : `Escolher ${plan.name}`}
              </Button>
            </div>
          );

          if (isActive) {
            return (
              <div
                key={plan.id}
                className="rounded-2xl p-[1.5px]"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
              >
                {card}
              </div>
            );
          }

          if (plan.highlighted) {
            return (
              <div
                key={plan.id}
                className="rounded-2xl p-[1.5px]"
                style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)" }}
              >
                {card}
              </div>
            );
          }

          return (
            <div key={plan.id} className="rounded-2xl border border-white/10">
              {card}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
