"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { type Post, type Category } from "@/lib/types/blog";
import { PostCard } from "./post-card";

const normalize = (text: string) => text.toLowerCase().replaceAll(" ", "");

function filterPosts(posts: Post[], category: Category | "all"): Post[] {
  return posts.filter(
    (post) =>
      !post.featured && (category == "all" || post.category === category),
  );
}

function searchPosts(posts: Post[], query: string) {
  if (!query) return posts;
  const q = normalize(query);
  return posts.filter((post) => normalize(post.title).includes(q));
}

export function BlogList({ posts }: { posts: Post[] }) {
  const t = useTranslations("Blog");
  const [query] = useQueryState("q", { defaultValue: "" });
  const [category] = useQueryState("category", {
    defaultValue: "all",
  });

  const visible = searchPosts(
    filterPosts(posts, category as Category | "all"),
    query,
  );

  if (visible.length === 0) {
    return (
      <p className="pt-16 pb-24 text-center text-black/40">{t("noResults")}</p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pt-13 pb-8 border-t border-black/10">
      {visible.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
