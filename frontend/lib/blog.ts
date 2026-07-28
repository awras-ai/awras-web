import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { type Post, type Category } from "./types/blog";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

const normalize = (text: string) => text.toLowerCase().replaceAll(" ", "");

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR);
  const allPostData = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(POSTS_DIR, fileName);
    const postContent = fs.readFileSync(fullPath, "utf-8");

    const metadata = matter(postContent).data;

    return { slug, ...metadata } as Post;
  });

  return allPostData.sort((a, b) => a.date.localeCompare(b.date));
}
export function getFeaturedPosts(posts: Post[]): Post | undefined {
  return posts.find((post) => post.featured);
}

export function filterPosts(posts: Post[], category: Category | "all"): Post[] {
  return posts.filter(
    (post) =>
      !post.featured && (category == "all" || post.category === category),
  );
}

export function searchPosts(posts: Post[], query: string) {
  if (!query) return posts;
  const q = normalize(query);
  return posts.filter((post) => normalize(post.title).includes(q));
}
