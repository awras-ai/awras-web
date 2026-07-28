"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { type Post, type Category } from "@/lib/types/blog";
import { PostCard } from "./post-card";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

const PAGE_SIZE = 6;

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

  const [count, setCount] = useState(PAGE_SIZE);

  // Reset pagination whenever the search or category changes.
  const filterKey = `${category}:${query}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setCount(PAGE_SIZE);
  }

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
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pt-13 pb-8 border-t border-black/10">
        {visible.slice(0, count).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {(count < visible.length || count > PAGE_SIZE) && (
        <div className="flex justify-center gap-3 pb-8">
          {count < visible.length && (
            <Button
              className="rounded-full"
              onClick={() => setCount((current) => current + PAGE_SIZE)}
            >
              <ArrowDown className="mr-2" size={16} />
              {t("loadMore")}
            </Button>
          )}

          {count > PAGE_SIZE && (
            <Button
              variant="outline"
              className="rounded-full "
              onClick={() =>
                setCount((current) => Math.max(PAGE_SIZE, current - PAGE_SIZE))
              }
            >
              <ArrowUp className="mr-2" size={16} />
              {t("loadLess")}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
