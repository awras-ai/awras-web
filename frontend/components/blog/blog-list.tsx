"use client";

import { useQueryState } from "nuqs";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type Post, type Category } from "@/lib/types/blog";
import { Byline } from "./byline";

function filterPosts(posts: Post[], category: Category | "all"): Post[] {
  return posts.filter(
    (post) => category === "all" || post.category === category,
  );
}

export function BlogList({ posts }: { posts: Post[] }) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const [category] = useQueryState("category", {
    defaultValue: "all",
  });

  const visible = filterPosts(posts, category as Category | "all");

  if (visible.length === 0) {
    return (
      <p className="pt-16 pb-24 text-center text-black/40">{t("noResults")}</p>
    );
  }

  return (
    <div className="pt-6 pb-20">
      {visible.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block py-8 border-b border-black/10 last:border-b-0"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent-brand)" }}
          >
            {t(`categories.${post.category}`)}
          </span>
          <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-balance group-hover:underline decoration-1 underline-offset-4">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed text-balance">
            {post.excerpt}
          </p>
          <Byline
            author={post.author}
            date={post.date}
            size="sm"
            locale={locale}
          />
        </Link>
      ))}
    </div>
  );
}
