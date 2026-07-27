import { meta as introducingAwrasChatV0 } from "./introducing-awras-chat-v0.mdx";
import { meta as topContributor } from "./237-annotations-top-contributor.mdx";
import { meta as transliteration } from "./transliteration-hardest-part.mdx";
import { meta as annotationStudio13 } from "./annotation-studio-1-3.mdx";
import { meta as keepingChaoui } from "./contributors-keeping-chaoui.mdx";
import { meta as speechCorpus } from "./40-hour-speech-corpus.mdx";
import { meta as streaksBadges } from "./streaks-badges-leaderboard.mdx";

export type Category = "research" | "product" | "community";

/** Frontmatter every post in `content/blog/*.mdx` exports as `meta`. */
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

export const CATEGORIES: Category[] = ["research", "product", "community"];

/** Newest first. */
export const POSTS: Post[] = [
  introducingAwrasChatV0,
  topContributor,
  transliteration,
  annotationStudio13,
  keepingChaoui,
  speechCorpus,
  streaksBadges,
].sort((a, b) => b.date.localeCompare(a.date));

export const FEATURED_POST = POSTS.find((post) => post.featured) ?? POSTS[0];
