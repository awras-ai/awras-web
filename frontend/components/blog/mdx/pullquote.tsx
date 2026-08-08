import type { ReactNode } from "react";

export function Pullquote({
  children,
  cite,
}: {
  children: ReactNode;
  cite?: string;
}) {
  return (
    <figure className="mt-10">
      {/* The mapped `p` would otherwise re-impose body size/spacing inside the quote. */}
      <blockquote className="text-xl md:text-[26px] leading-snug font-semibold tracking-tight [&>p]:[margin:0] [&>p]:[font-size:inherit] [&>p]:[line-height:inherit] [&>p]:text-inherit">
        {children}
      </blockquote>
      {cite ? (
        <figcaption
          className="mt-3.5 text-[13px] font-medium tracking-widest uppercase"
          style={{ color: "var(--accent-brand)" }}
        >
          {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}
