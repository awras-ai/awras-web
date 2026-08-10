import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { routing } from "@/i18n/routing";
import { type Post } from "./types/blog";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

// content/blog/{slug}.mdx is canonical (English). content/blog/{locale}/{slug}.mdx
// holds a locale's translated counterpart. Missing translation falls back to the
// canonical file so an untranslated post still renders. See frontend/AGENTS.md.
function resolvePostPath(locale: string, slug: string): string {
  if (locale !== routing.defaultLocale) {
    const localizedPath = path.join(POSTS_DIR, locale, `${slug}.mdx`);
    if (fs.existsSync(localizedPath)) return localizedPath;
  }

  return path.join(POSTS_DIR, `${slug}.mdx`);
}

export function getAllPosts(locale: string = routing.defaultLocale): Post[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const allPostData = files.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = resolvePostPath(locale, slug);
    const postContent = fs.readFileSync(fullPath, "utf-8");

    const metadata = matter(postContent).data;

    return { slug, ...metadata } as Post;
  });

  return allPostData.sort((a, b) => a.date.localeCompare(b.date));
}
export function getFeaturedPosts(posts: Post[]): Post | undefined {
  return posts.find((post) => post.featured);
}

export function getPostBySlug(
  locale: string,
  slug: string,
): { frontmatter: Post; content: string } | null {
  const fullPath = resolvePostPath(locale, slug);
  if (!fs.existsSync(fullPath)) return null;

  const { data, content } = matter(fs.readFileSync(fullPath, "utf-8"));

  return { frontmatter: { slug, ...data } as Post, content };
}
