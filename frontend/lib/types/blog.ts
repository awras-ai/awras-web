export type Category = "research" | "product" | "community";

export type Post = {
  slug: string;
  category: Category;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: number;
  featured: boolean;
};
