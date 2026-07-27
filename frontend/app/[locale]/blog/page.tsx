"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CATEGORIES, FEATURED_POST, POSTS, type Category } from "@/content/blog/posts";

const ACCENT = "#14b8a6";
const FILTERS = ["all", ...CATEGORIES] as const;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(
    new Date(date)
  );

const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Byline({
  author,
  date,
  size,
}: {
  author: string;
  date: string;
  size: "sm" | "default";
}) {
  const small = size === "sm";

  return (
    <div
      className={`flex items-center ${small ? "gap-2 mt-4" : "gap-3 mt-7"}`}
    >
      <Avatar size={size}>
        <AvatarFallback>{initials(author)}</AvatarFallback>
      </Avatar>
      <span
        className={
          small ? "text-xs font-medium text-neutral-600" : "text-sm font-semibold"
        }
      >
        {author}
      </span>
      {!small && <span className="w-1 h-1 rounded-full bg-neutral-300" />}
      <span
        className={small ? "text-xs text-neutral-300" : "text-sm text-neutral-400"}
      >
        {formatDate(date)}
      </span>
    </div>
  );
}

export default function BlogPage() {
  const t = useTranslations("Blog");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const posts = POSTS.filter(
    (post) =>
      !post.featured &&
      (filter === "all" || post.category === filter) &&
      post.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs font-semibold text-black/40 tracking-widest uppercase mb-3">
          {t("label")}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl text-balance">
          {t.rich("headline", {
            accent: (chunks) => <span style={{ color: ACCENT }}>{chunks}</span>,
          })}
        </h1>
        <p className="mt-6 text-lg text-black/50 max-w-xl">{t("description")}</p>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-13 pb-6 border-b border-black/10">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === value
                    ? "bg-black text-white"
                    : "border border-black/10 text-neutral-600 hover:border-black/30"
                }`}
              >
                {value === "all" ? t("allPosts") : t(`categories.${value}`)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-68 px-4 py-2.5 border border-black/10 rounded-full text-neutral-400">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm text-black placeholder:text-neutral-400 outline-none"
            />
          </div>
        </div>

        {/* Featured post */}
        {filter === "all" && !query && (
          <Link
            href={`/blog/${FEATURED_POST.slug}`}
            className="group grid md:grid-cols-2 gap-10 items-center py-11"
          >
            <div className="h-72 md:h-85 rounded-2xl bg-neutral-100 overflow-hidden" />
            <div>
              <div className="flex items-center gap-3 text-xs font-semibold tracking-widest uppercase">
                <span style={{ color: ACCENT }}>
                  {t(`categories.${FEATURED_POST.category}`)}
                </span>
                <span className="w-4 h-px bg-neutral-300" />
                <span className="text-neutral-400">
                  {t("readTime", { minutes: FEATURED_POST.readTime })}
                </span>
              </div>
              <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-balance group-hover:underline decoration-1 underline-offset-4">
                {FEATURED_POST.title}
              </h2>
              <p className="mt-4 text-black/50 leading-relaxed max-w-md">
                {FEATURED_POST.excerpt}
              </p>
              <Byline
                author={FEATURED_POST.author}
                date={FEATURED_POST.date}
                size="default"
              />
              <div className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 bg-black text-white rounded-full text-sm font-semibold group-hover:scale-105 transition-transform">
                {t("readRelease")}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pt-13 pb-8 border-t border-black/10">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <div className="h-49 rounded-xl bg-neutral-100 overflow-hidden" />
                <div
                  className="mt-4.5 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: ACCENT }}
                >
                  {t(`categories.${post.category}`)}
                </div>
                <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-balance group-hover:underline decoration-1 underline-offset-4">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed text-balance">
                  {post.excerpt}
                </p>
                <Byline author={post.author} date={post.date} size="sm" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="pt-16 pb-24 text-center text-black/40">{t("noResults")}</p>
        )}
      </motion.div>
    </div>
  );
}
