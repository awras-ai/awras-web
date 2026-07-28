import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { type Post } from "./types/blog";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR);
  const allPostData = files.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
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
