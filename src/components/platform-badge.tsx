type PlatformCfg = { bg: string; text: string; border?: string; label: string };

const PLATFORM_MAP: Record<string, PlatformCfg> = {
  meta:     { bg: "#7C3AED", text: "#fff", label: "Meta" },
  facebook: { bg: "#7C3AED", text: "#fff", label: "Meta" },
  tiktok:   { bg: "#000",    text: "#fff", border: "rgba(255,255,255,0.2)", label: "TikTok" },
  google:   { bg: "#3B82F6", text: "#fff", label: "Google" },
  google_ads: { bg: "#3B82F6", text: "#fff", label: "Google" },
  kwai:     { bg: "#F97316", text: "#fff", label: "Kwai" },
};

export function PlatformBadge({ platform }: { platform: string }) {
  const key = (platform || "").toLowerCase();
  const cfg =
    PLATFORM_MAP[key] ??
    { bg: "#1C1C1E", text: "#94A3B8", border: "rgba(255,255,255,0.08)", label: platform || "—" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: cfg.border ? `1px solid ${cfg.border}` : "1px solid transparent",
      }}
    >
      {cfg.label}
    </span>
  );
}

type TemplateCfg = { bg: string; text: string; label: string };

const TEMPLATE_MAP: Record<string, TemplateCfg> = {
  vsl:       { bg: "rgba(99,102,241,0.15)",  text: "#6366F1", label: "VSL" },
  ecommerce: { bg: "rgba(16,185,129,0.15)",  text: "#10B981", label: "E-commerce" },
  lead_quiz: { bg: "rgba(245,158,11,0.15)",  text: "#F59E0B", label: "Lead Quiz" },
  lead:      { bg: "rgba(245,158,11,0.15)",  text: "#F59E0B", label: "Lead Quiz" },
  local_x1:  { bg: "rgba(236,72,153,0.15)",  text: "#EC4899", label: "Local X1" },
};

export function TemplateBadge({ template }: { template: string }) {
  const key = (template || "").toLowerCase();
  const cfg =
    TEMPLATE_MAP[key] ?? { bg: "rgba(255,255,255,0.06)", text: "#94A3B8", label: template || "—" };
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}