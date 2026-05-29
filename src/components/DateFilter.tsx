import { useState } from "react";

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
    <div className="relative flex justify-start">
      <div className="flex flex-wrap items-center gap-1">
        {OPTIONS.map((opt) => {
          const active = value.preset === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => select(opt.id)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #7c3aed" : "2px solid transparent",
                color: active ? "#ffffff" : "#555",
                borderRadius: 0,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {showPicker && (
        <div
          className="absolute left-0 top-full z-20 mt-2 flex flex-col gap-3 p-4"
          style={{ background: "#111111", border: "1px solid #2a2a2a", borderRadius: 12, minWidth: 280 }}
        >
          <label className="flex flex-col gap-1 text-xs" style={{ color: "#a0a0a0" }}>
            De
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: "6px 10px", color: "#fff" }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: "#a0a0a0" }}>
            Até
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: "6px 10px", color: "#fff" }}
            />
          </label>
          <button
            type="button"
            onClick={applyCustom}
            className="btn-gradient rounded-md py-2 text-sm font-medium text-white"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}