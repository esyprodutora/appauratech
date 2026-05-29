import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  EyeOff, Banknote, TrendingDown, User, Gauge, ShieldCheck,
  Activity, Layers, Link2, Globe, Bot, Code2, Check, ChevronDown,
  Menu, X, ArrowRight, Zap, Sparkles,
} from "lucide-react";

const REGISTER_URL = "/register";

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
      node.style.opacity = "0";
      node.style.transform = "translateY(16px)";
      node.style.transition = "opacity 600ms ease, transform 600ms ease";
      io.observe(node);
    });
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const rootRef = useReveal();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0A0A0B] text-[#F8FAFC] scroll-smooth">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Templates />
      <Agencies />
      <Numbers />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const links = [
    { href: "#problema", label: "Problema" },
    { href: "#solucao", label: "Solução" },
    { href: "#recursos", label: "Recursos" },
    { href: "#oferta", label: "Planos" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] backdrop-blur-md bg-[rgba(10,10,11,0.6)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#7c3aed" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="9" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
            <circle cx="16" cy="16" r="3" fill="#7c3aed"/>
          </svg>
          <span className="text-white font-bold text-lg">aura<span className="text-[#A855F7]">.</span></span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[#94A3B8] transition-colors hover:text-white">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm text-[#94A3B8] hover:text-white">Entrar</Link>
          <Link to="/register" className="rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-transform hover:scale-[1.02]">
            Criar conta
          </Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#0A0A0B] md:hidden">
          <div className="flex flex-col gap-1 px-5 py-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2 text-sm text-[#94A3B8] hover:bg-white/5 hover:text-white">{l.label}</a>
            ))}
            <Link to="/register" className="mt-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-4 py-2.5 text-center text-sm font-semibold text-white">Criar conta</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(closest-side, #6366F1, transparent 70%)" }} />
      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span data-reveal className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141415] px-3 py-1.5 text-xs text-[#94A3B8]">
              <Zap size={14} className="text-[#A855F7]" />
              Qualificação de tráfego server-side — sem depender do pixel
            </span>
            <h1 data-reveal className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              As plataformas de anúncios estão <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">cegas</span> para seus melhores compradores.
            </h1>
            <p data-reveal className="mt-5 max-w-xl text-base leading-relaxed text-[#94A3B8] md:text-lg">
              O AURA monitora o comportamento real de cada visitante, calcula um score de intenção de 0 a 100 e só envia os eventos de alta qualidade para o Meta, TikTok e Google — direto do servidor, sem pixel do navegador.
            </p>
            <div data-reveal className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-transform hover:scale-[1.02]">
                Quero qualificar meu tráfego <ArrowRight size={16} />
              </Link>
              <a href="#solucao" className="text-sm text-[#94A3B8] hover:text-white">Ver como funciona ↓</a>
            </div>
            <div data-reveal className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Instalação em 5 minutos</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Sem código</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Meta, TikTok, Google e Kwai</span>
            </div>
          </div>
          <div data-reveal>
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const metrics = [
    { label: "Sessões hoje", value: "12.847", delta: "+18%" },
    { label: "Score médio", value: "73", delta: "+6 pts" },
    { label: "Qualificadas", value: "4.219", delta: "+24%" },
    { label: "CAPI enviados", value: "3.881", delta: "+22%" },
  ];
  return (
    <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-5 shadow-[0_30px_80px_-30px_rgba(99,102,241,0.5)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          aura · dashboard · ao vivo
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1C1C1E] p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{m.label}</div>
            <div className="mt-1.5 text-2xl font-bold">{m.value}</div>
            <div className="text-[11px] font-medium text-[#10B981]">{m.delta} vs ontem</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1C1C1E] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">Sessões qualificadas — últimos 7 dias</span>
        </div>
        <svg viewBox="0 0 320 110" className="h-28 w-full">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="320" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="lgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,88 L46,78 L92,82 L138,62 L184,55 L230,38 L276,28 L320,12 L320,110 L0,110 Z" fill="url(#lgFill)" />
          <path d="M0,88 L46,78 L92,82 L138,62 L184,55 L230,38 L276,28 L320,12" stroke="url(#lg)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle, center = true }: { eyebrow?: string; title: React.ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      {eyebrow && <span data-reveal className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A855F7]">{eyebrow}</span>}
      <h2 data-reveal className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p data-reveal className="mt-4 text-[#94A3B8] md:text-lg">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div data-reveal className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-6 transition-all hover:border-[rgba(99,102,241,0.4)] hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{children}</p>
    </div>
  );
}

function Problem() {
  return (
    <section id="problema" className="border-t border-[rgba(255,255,255,0.06)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionTitle eyebrow="O problema" title="Por que suas campanhas convertem cada vez menos?" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <FeatureCard icon={EyeOff} title="O Pixel está quebrado">O iOS 14+, navegadores com bloqueio de anúncios e a LGPD destruíram a qualidade do sinal que o Meta recebe. Seu pixel está cego.</FeatureCard>
          <FeatureCard icon={Banknote} title="Você paga por qualquer clique">Bot, curioso, concorrente — o Facebook trata todos como potenciais compradores e otimiza sua campanha para o público errado.</FeatureCard>
          <FeatureCard icon={TrendingDown} title="O algoritmo aprende errado">Sem dados de qualidade, o algoritmo cria lookalikes ruins e desperdiça seu orçamento em pessoas que nunca vão comprar.</FeatureCard>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const steps = [
    { n: "01", icon: User, t: "Visitante chega", d: "O script do AURA monitora silenciosamente: tempo na página, scroll, cliques, troca de aba, interação com o checkout." },
    { n: "02", icon: Gauge, t: "Score calculado", d: "Um score de 0 a 100 é calculado em tempo real no servidor. Visitantes com score baixo são descartados — o banco nem é tocado." },
    { n: "03", icon: ShieldCheck, t: "Evento blindado enviado", d: "Apenas os eventos de alta intenção são enviados para Meta, TikTok e Google via API de Conversões (CAPI) — nunca pelo pixel do navegador." },
  ];
  return (
    <section id="solucao" className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0E] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionTitle eyebrow="A solução" title={<>O AURA é um <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">Pedágio Inteligente</span> entre seu site e as plataformas de anúncios.</>} subtitle="Apenas visitantes com intenção real de compra chegam ao algoritmo." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} data-reveal className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-6 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#6366F1]/30 bg-[#0A0A0B] text-white shadow-[0_0_28px_rgba(99,102,241,0.35)]">
                <s.icon size={22} />
              </div>
              <div className="mt-3 text-xs font-semibold tracking-widest text-[#A855F7]">PASSO {s.n}</div>
              <h3 className="mt-1 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { i: Activity, t: "Score Comportamental 0–100", d: "Tempo ativo, scroll depth, cliques em FAQ, interações com checkout. Cada ação pontua. Só passa quem merece." },
    { i: Layers, t: "Eventos em Camadas", d: "Page View passa normalmente. Eventos de alta intenção só via CAPI server-side. O Facebook nunca vê o que não deve." },
    { i: Link2, t: "Identity Stitching", d: "Quando uma compra acontece na Kiwify ou Hotmart, o AURA encontra os cookies e envia o Purchase blindado para o Meta." },
    { i: Globe, t: "Omnicanal", d: "Meta, TikTok, Google Ads e Kwai for Business. Um script, todas as plataformas, roteamento automático por cookie de origem." },
    { i: Bot, t: "Anti-Bot Nativo", d: "Bots conhecidos recebem resposta silenciosa. Zero custo de banco, zero contaminação de dados." },
    { i: Code2, t: "Instalação como Pixel", d: "Uma linha de código antes do </head>. Funciona em WordPress, Shopify, Kiwify, Hotmart, HTML puro." },
  ];
  return (
    <section id="recursos" className="border-t border-[rgba(255,255,255,0.06)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionTitle eyebrow="Funcionalidades" title="Tudo que você precisa para blindar seu tráfego" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => <FeatureCard key={it.t} icon={it.i} title={it.t}>{it.d}</FeatureCard>)}
        </div>
      </div>
    </section>
  );
}

function Templates() {
  const tpl = [
    { t: "VSL / Infoproduto", d: "Cronômetro pausa quando o usuário troca de aba. Score sobe por tempo ativo assistindo, cliques em FAQ e hover no botão de compra.", tag: "VSL" },
    { t: "E-commerce", d: "Score sobe por scroll até avaliações, visualização da galeria, clique em variações de produto e adição ao carrinho.", tag: "E-COM" },
    { t: "Captura de Leads / Quiz", d: "Score sobe por tempo de leitura antes do formulário, foco no campo sem submit imediato e avanço em etapas do quiz.", tag: "LEAD" },
    { t: "Negócio Local / WhatsApp", d: "Resolve o 'clique fantasma'. Só registra como lead quando o visitante realmente interage — não apenas clica no link.", tag: "LOCAL" },
  ];
  return (
    <section className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0E] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionTitle eyebrow="Templates" title="4 templates otimizados para cada tipo de negócio" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tpl.map((c) => (
            <div key={c.t} data-reveal className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-6 transition-all hover:border-[rgba(99,102,241,0.4)]">
              <span className="inline-flex items-center rounded-md bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">{c.tag}</span>
              <h3 className="mt-3 text-lg font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Agencies() {
  const items = [
    "Relatório de atribuição qualitativa: compare a qualidade do tráfego por plataforma — não só volume, mas score médio, taxa de qualificação e leads quentes por fonte.",
    "Whitelabel disponível no plano Enterprise: entregue o AURA com a sua marca para seus clientes.",
    "Uma conta, múltiplos workspaces: gerencie todos os clientes da agência em um único painel, cada um com seu token e configurações independentes.",
  ];
  return (
    <section className="border-t border-[rgba(255,255,255,0.06)] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <SectionTitle eyebrow="Para gestores e agências" title="Entregue resultados que seus clientes nunca viram antes." />
        <div data-reveal className="mt-10 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-6 md:p-10">
          <ul className="space-y-5">
            {items.map((t, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]"><Check size={16} /></span>
                <p className="text-sm leading-relaxed text-[#CBD5E1] md:text-base">{t}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Numbers() {
  const stats = [
    { v: "+340%", l: "Melhoria média na qualidade do sinal CAPI" },
    { v: "-60%", l: "Redução de eventos contaminados por bots" },
    { v: "4", l: "Plataformas: Meta, TikTok, Google e Kwai" },
    { v: "5 min", l: "Tempo médio de instalação" },
  ];
  return (
    <section className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0E] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionTitle eyebrow="Números" title="Números que importam" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} data-reveal className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415] p-6 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent md:text-5xl">{s.v}</div>
              <div className="mt-2 text-sm text-[#94A3B8]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter", from: "R$197", price: "R$118", featured: false,
      features: ["1 workspace", "50k sessões/mês", "1 plataforma de anúncios", "2 templates", "Suporte por email"],
      cta: "Começar com Starter",
    },
    {
      name: "Growth", from: "R$497", price: "R$298", featured: true,
      features: ["3 workspaces", "300k sessões/mês", "Todas as plataformas", "Todos os templates", "CRM WhatsApp básico", "Identity Stitching"],
      cta: "Começar com Growth",
    },
    {
      name: "Scale", from: "R$997", price: "R$598", featured: false,
      features: ["10 workspaces", "2M sessões/mês", "Modo Avançado", "Relatório de atribuição por fonte", "Suporte prioritário"],
      cta: "Começar com Scale",
    },
  ];
  return (
    <section id="oferta" className="border-t border-[rgba(255,255,255,0.06)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mx-auto text-center">
          <span data-reveal className="inline-flex items-center gap-2 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 px-3 py-1.5 text-xs font-semibold text-[#E9D5FF]">
            <Sparkles size={14} />
            Oferta de Fundador — 50 vagas com 40% OFF vitalício
          </span>
          <h2 data-reveal className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Escolha seu plano</h2>
          <p data-reveal className="mt-3 text-[#94A3B8]">Preços com desconto de fundador. Garantido para sempre enquanto mantiver a assinatura.</p>
          <p data-reveal className="mt-2 text-xs font-medium text-[#A855F7]">Vagas restantes: 47</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} data-reveal className={`relative rounded-2xl border bg-[#141415] p-6 md:p-7 ${p.featured ? "border-[#6366F1] shadow-[0_0_40px_rgba(99,102,241,0.25)]" : "border-[rgba(255,255,255,0.08)]"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Mais popular</span>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-sm text-[#64748B] line-through">{p.from}</span>
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-[#94A3B8]">/mês</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#CBD5E1]">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#10B981]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={REGISTER_URL} className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${p.featured ? "bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]" : "border border-[rgba(255,255,255,0.1)] bg-[#1C1C1E] text-white"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Cancele quando quiser</span>
          <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Sem fidelidade</span>
          <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#10B981]" />Desconto vitalício garantido</span>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: "Como o AURA é diferente do pixel normal do Facebook?", a: "O pixel do navegador é bloqueado por iOS, extensões e navegadores. O AURA envia os eventos direto do servidor via API de Conversões — o Meta recebe o sinal completo independente do dispositivo ou bloqueador." },
    { q: "Precisa saber programar para instalar?", a: "Não. É uma linha de código colada antes do </head> do seu site — igual ao pixel do Facebook. Qualquer pessoa que saiba instalar o pixel consegue instalar o AURA." },
    { q: "Funciona com Kiwify, Hotmart e outros gateways?", a: "Sim. O AURA tem integração via webhook com Kiwify, Hotmart, Stripe, Yampi e PerfectPay." },
    { q: "O que é o score comportamental?", a: "É uma nota de 0 a 100 calculada em tempo real baseada no comportamento do visitante: quanto tempo ficou na página, até onde rolou, se interagiu com o checkout." },
    { q: "Funciona para TikTok e Google também?", a: "Sim. O script detecta automaticamente se o visitante veio do Meta, TikTok, Google ou Kwai e roteia o evento para a plataforma correta." },
    { q: "E a LGPD?", a: "O AURA nunca trafega dados pessoais em claro. E-mail e telefone são hasheados com SHA-256 imediatamente no servidor antes de qualquer envio." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-[rgba(255,255,255,0.06)] bg-[#0C0C0E] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <SectionTitle eyebrow="FAQ" title="Perguntas frequentes" />
        <div className="mt-10 divide-y divide-[rgba(255,255,255,0.08)] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141415]">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} data-reveal>
                <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
                  <span className="font-medium text-white">{it.q}</span>
                  <ChevronDown size={18} className={`shrink-0 text-[#94A3B8] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <div className="px-5 pb-5 text-sm leading-relaxed text-[#94A3B8]">{it.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-[rgba(255,255,255,0.06)] py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), transparent 70%)" }} />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <h2 data-reveal className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          Seu próximo cliente já está no seu site. <span className="bg-gradient-to-r from-[#6366F1] to-[#A855F7] bg-clip-text text-transparent">Você só não está vendo.</span>
        </h2>
        <p data-reveal className="mx-auto mt-5 max-w-xl text-[#94A3B8] md:text-lg">
          Instale o AURA em 5 minutos e comece a qualificar seu tráfego hoje.
        </p>
        <Link data-reveal to={REGISTER_URL} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-7 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-transform hover:scale-[1.03] md:text-base">
          Começar agora — 50 vagas com 40% OFF <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#0A0A0B] py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#7c3aed" strokeWidth="1.5"/>
              <circle cx="16" cy="16" r="9" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
              <circle cx="16" cy="16" r="3" fill="#7c3aed"/>
            </svg>
            <span className="text-white font-bold">aura<span className="text-[#A855F7]">.</span></span>
          </div>
          <p className="mt-2 text-xs text-[#64748B]">Inteligência invisível. Resultado real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#94A3B8]">
          <a href="#" className="hover:text-white">Termos de Uso</a>
          <a href="#" className="hover:text-white">Privacidade</a>
          <a href="#" className="hover:text-white">Contato</a>
        </div>
        <p className="text-xs text-[#64748B]">© 2026 AURA. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
