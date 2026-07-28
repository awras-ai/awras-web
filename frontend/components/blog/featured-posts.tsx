"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Byline } from "./byline";
import type { Post } from "@/lib/types/blog";

export function FeaturedPost({ post }: { post: Post }) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid md:grid-cols-2 gap-10 items-center py-11"
    >
      <div className="h-72 md:h-85 rounded-2xl overflow-hidden relative bg-neutral-100">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : null}
      </div>
      <div>
        <div className="flex items-center gap-3 text-xs font-semibold tracking-widest uppercase">
          <span style={{ color: "var(--accent-brand)" }}>
            {t(`categories.${post.category}`)}
          </span>
          <span className="w-4 h-px bg-neutral-300" />
          <span className="text-neutral-400">
            {t("readTime", { minutes: post.readTime })}
          </span>
        </div>
        <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-balance group-hover:underline decoration-1 underline-offset-4">
          {post.title}
        </h2>
        <p className="mt-4 text-black/50 leading-relaxed max-w-md">
          {post.excerpt}
        </p>
        <Byline
          author={post.author}
          date={post.date}
          size="default"
          locale={locale}
        />
        <div className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-black text-white rounded-full text-sm font-semibold group-hover:scale-105 transition-transform">
          {t("readRelease")}
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
