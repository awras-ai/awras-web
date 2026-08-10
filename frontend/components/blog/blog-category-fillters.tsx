"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { type Category } from "@/lib/types/blog";

const FILTERS = ["all", "research", "product", "community"] as const;

export function BlogCategoryFilters() {
  const t = useTranslations("Blog");
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
  });

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setCategory(value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            category === value
              ? "bg-black text-white"
              : "border border-black/10 text-neutral-600 hover:border-black/30"
          }`}
        >
          {value === "all"
            ? t("allPosts")
            : t(`categories.${value as Category}`)}
        </button>
      ))}
    </div>
  );
}
