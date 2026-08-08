declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { Post } from "@/content/blog/posts";

  export const meta: Post;
  const MDXContent: ComponentType<{ components?: Record<string, ComponentType> }>;
  export default MDXContent;
}
