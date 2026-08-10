import type { ReactNode } from "react";

export function Stats({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-7 mt-10">{children}</div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="w-8.5 h-0.75"
        style={{ background: "var(--accent-brand)" }}
      />
      <div className="mt-4 text-3xl md:text-[38px] leading-none font-bold tracking-tight">
        {value}
      </div>
      <div className="mt-2.5 text-[11px] font-medium tracking-widest uppercase text-neutral-400">
        {label}
      </div>
    </div>
  );
}
