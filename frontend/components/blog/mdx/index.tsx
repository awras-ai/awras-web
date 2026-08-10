import type { ComponentProps } from "react";
import { Figure } from "./figure";
import { Pullquote } from "./pullquote";
import { Stat, Stats } from "./stats";

// The article body's design system. Every element an author can produce from
// markdown is styled here, so `.mdx` files stay free of presentation.
// See frontend/AGENTS.md ("Blog articles") for the authoring contract.
export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="mt-13 text-3xl md:text-[38px] font-bold tracking-tight text-balance"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-13 text-2xl md:text-[27px] leading-tight font-bold tracking-tight text-balance"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-10 text-xl font-semibold tracking-tight text-balance"
      {...props}
    />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4 className="mt-8 text-lg font-semibold tracking-tight" {...props} />
  ),

  p: (props: ComponentProps<"p">) => (
    <p
      className="mt-6.5 first:mt-0 text-[17px] md:text-lg leading-[1.78] text-neutral-800"
      {...props}
    />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-black" {...props} />
  ),
  em: (props: ComponentProps<"em">) => <em className="italic" {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a
      className="underline underline-offset-4 decoration-1 hover:text-black transition-colors"
      style={{ color: "var(--accent-brand)" }}
      {...props}
    />
  ),

  ul: (props: ComponentProps<"ul">) => (
    <ul className="mt-6.5 ps-6 list-disc marker:text-neutral-300" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="mt-6.5 ps-6 list-decimal marker:text-neutral-400"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => (
    <li
      className="mt-2 text-[17px] md:text-lg leading-[1.78] text-neutral-800"
      {...props}
    />
  ),

  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-6.5 ps-5 border-s-2 border-black/10 text-neutral-500 [&>p]:mt-0 [&>p]:text-inherit"
      {...props}
    />
  ),
  hr: (props: ComponentProps<"hr">) => (
    <hr className="mt-13 border-black/10" {...props} />
  ),

  img: (props: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="mt-10 w-full rounded-2xl" alt="" {...props} />
  ),

  code: (props: ComponentProps<"code">) => (
    <code
      className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.9em] font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="mt-6.5 rounded-xl p-5 overflow-x-auto text-sm bg-neutral-950 [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),

  table: (props: ComponentProps<"table">) => (
    <div className="mt-6.5 overflow-x-auto">
      <table
        className="w-full text-[15px] border border-black/10 rounded-xl border-separate border-spacing-0"
        {...props}
      />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      className="px-5.5 py-3.5 text-start bg-neutral-50 text-[11px] font-semibold tracking-widest uppercase text-neutral-400 border-b border-black/10 first:rounded-ss-xl last:rounded-se-xl"
      {...props}
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td
      className="px-5.5 py-4 border-b border-black/5 text-neutral-800"
      {...props}
    />
  ),
  // The last body row is the highlighted "subject" row — see frontend/AGENTS.md.
  tbody: (props: ComponentProps<"tbody">) => (
    <tbody
      className="[&>tr:last-child]:bg-[#F4FCFA] [&>tr:last-child>td]:border-b-0 [&>tr:last-child>td:first-child]:rounded-es-xl [&>tr:last-child>td:last-child]:rounded-ee-xl"
      {...props}
    />
  ),

  Stats,
  Stat,
  Pullquote,
  Figure,
};
