import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Byline } from "@/components/blog/byline";
import { MDXContent } from "@/components/blog/mdx-content";

export const dynamicParams = false;
export const dynamic = "force-static";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const posts = getAllPosts();

  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);

  if (!post) return {};

  const { title, excerpt } = post.frontmatter;

  return {
    title,
    description: excerpt,
    openGraph: { type: "article", title, description: excerpt },
    twitter: { card: "summary_large_image", title, description: excerpt },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "Blog" });
  const {
    category,
    title,
    excerpt,
    author,
    date,
    readTime,
    image,
    imageCaption,
  } = post.frontmatter;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 md:pt-20 pb-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t("backToBlog")}
      </Link>

      <div className="flex items-center gap-3 mt-8 text-xs font-semibold tracking-widest uppercase">
        <span style={{ color: "var(--accent-brand)" }}>
          {t(`categories.${category}`)}
        </span>
        <span className="w-4 h-px bg-neutral-300" />
        <span className="text-neutral-400">
          {t("readTime", { minutes: readTime })}
        </span>
      </div>

      <h1 className="mt-5 text-3xl md:text-[46px] leading-[1.1] font-bold tracking-[-0.035em] text-balance">
        {title}
      </h1>

      <p className="mt-5 text-lg md:text-[19px] leading-[1.6] text-neutral-500 text-balance">
        {excerpt}
      </p>

      <div className="mt-8 py-5.5 border-y border-black/10 [&>div]:mt-0">
        <Byline author={author} date={date} size="default" locale={locale} />
      </div>

      {image ? (
        <figure className="mt-11">
          <div className="h-64 md:h-108 rounded-2xl overflow-hidden relative bg-neutral-100">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
          {imageCaption ? (
            <figcaption className="mt-3.5 text-center text-sm text-neutral-400">
              {imageCaption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div className="mt-14">
        <MDXContent content={post.content} />
      </div>

      <Link
        href="/annotation"
        className="group flex items-center justify-between gap-7 mt-14 px-7 py-6.5 rounded-2xl bg-[#F4FCFA] border border-[#B7EDE4]"
      >
        <div>
          <p className="text-lg md:text-[19px] leading-snug font-semibold tracking-tight text-balance">
            {t("articleCtaTitle")}
          </p>
          <p className="mt-2 text-sm md:text-[14.5px] text-[#5C7A75]">
            {t("articleCtaDescription")}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-full text-sm font-semibold group-hover:scale-105 transition-transform">
          {t("articleCtaAction")}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </span>
      </Link>
    </article>
  );
}
