import { useEffect, useRef, useState } from "react";

export type RangePreset = "today" | "yesterday" | "7d" | "28d" | "custom";

export interface DateRange {
  preset: RangePreset;
  from: Date;
  to: Date;
}

export function computeRange(preset: RangePreset, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  if (preset === "today") {
    const from = new Date(now); from.setHours(0, 0, 0, 0);
    return { preset, from, to: now };
  }
  if (preset === "yesterday") {
    const from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setHours(23, 59, 59, 999);
    return { preset, from, to };
  }
  if (preset === "7d") {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { preset, from, to: now };
  }
  if (preset === "28d") {
    const from = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    return { preset, from, to: now };
  }
  // custom
  const from = customFrom ? new Date(customFrom + "T00:00:00") : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const to = customTo ? new Date(customTo + "T23:59:59") : now;
  return { preset: "custom", from, to };
}

const OPTIONS: Array<{ id: RangePreset; label: string }> = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "7d", label: "7 dias" },
  { id: "28d", label: "28 dias" },
  { id: "custom", label: "Período" },
];

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

export default function DateFilter({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [from, setFrom] = useState(value.from.toISOString().slice(0, 10));
  const [to, setTo] = useState(value.to.toISOString().slice(0, 10));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showPicker]);

  const select = (id: RangePreset) => {
    if (id === "custom") {
      setShowPicker((s) => !s);
      return;
    }
    setShowPicker(false);
    onChange(computeRange(id));
  };

  const applyCustom = () => {
    onChange(computeRange("custom", from, to));
    setShowPicker(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", justifyContent: "flex-end" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {OPTIONS.map((opt) => {
          const active = value.preset === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                color: active ? "#FFFFFF" : "#94A3B8",
                border: active
                  ? "1px solid rgba(99,102,241,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {showPicker && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 50,
            width: 280,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#a0a0a0", flex: 1 }}>
              De
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{ background: "#0a0a0b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", width: "100%", boxSizing: "border-box" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#a0a0a0", flex: 1 }}>
              Até
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ background: "#0a0a0b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", width: "100%", boxSizing: "border-box" }}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={applyCustom}
            style={{
              marginTop: 12,
              width: "100%",
              height: 36,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(90deg, #6366F1, #A855F7)",
            }}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}