import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "R$ 97",
    period: "/mês",
    description: "Para quem está começando",
    features: [
      "1 Workspace",
      "10.000 eventos/mês",
      "Dashboard básico",
      "Suporte por email",
    ],
    cta: "Escolher Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 297",
    period: "/mês",
    description: "Para profissionais",
    features: [
      "5 Workspaces",
      "100.000 eventos/mês",
      "Dashboard avançado",
      "CAPI Events",
      "Suporte prioritário",
    ],
    cta: "Escolher Pro",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "R$ 997",
    period: "/mês",
    description: "Para agências",
    features: [
      "Workspaces ilimitados",
      "1.000.000 eventos/mês",
      "API completa",
      "White label",
      "Suporte dedicado",
    ],
    cta: "Escolher Agency",
    highlighted: false,
  },
];

export default function Plans() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Planos</h1>
        <p className="mt-2 text-muted-foreground">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={plan.highlighted ? "default" : "outline"}>
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
