import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
// import { BlogSearchInput } from "@/components/blog/blog-search-input";
import { BlogCategoryFilters } from "@/components/blog/blog-category-fillters";
import { BlogList } from "@/components/blog/blog-list";

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const posts = getAllPosts(locale);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
      <p className="text-xl font-semibold text-black/40 tracking-widest uppercase mb-3">
        {t("label")}
      </p>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl text-balance">
        {t.rich("headline", {
          accent: (chunks) => (
            <span style={{ color: "--var-accent" }}>{chunks}</span>
          ),
        })}
      </h1>
      <p className="mt-6 text-lg text-black/50 max-w-xl">{t("description")}</p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-13 pb-6 border-b border-black/10">
        <BlogCategoryFilters />
        {/* <BlogSearchInput /> */}
      </div>

      <BlogList posts={posts} />
    </div>
  );
}
