"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Byline } from "./byline";
import type { Post } from "@/lib/types/blog";

export function PostCard({ post }: { post: Post }) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <div className="h-49 rounded-xl overflow-hidden relative bg-neutral-100">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div
        className="mt-4.5 text-xs font-semibold tracking-widest uppercase"
        style={{ color: "var(--accent-brand)" }}
      >
        {t(`categories.${post.category}`)}
      </div>
      <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-balance group-hover:underline decoration-1 underline-offset-4">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed text-balance">
        {post.excerpt}
      </p>
      <Byline author={post.author} date={post.date} size="sm" locale={locale} />
    </Link>
  );
}
