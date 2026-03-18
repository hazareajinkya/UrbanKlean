export type BlogFaq = { question: string; answer: string };

export interface BlogWithAuthor {
  id: string;
  wid: string;
  title: string;
  content: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published: boolean;
  featuredImage?: string;
  excerpt?: string;
  keyTakeaway?: string;
  faqs?: BlogFaq[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  tags?: string[];
  categories?: string[];
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastSavedAt?: string;
  author: {
    id: string;
    name: string;
    description: string;
    email: string;
    profilePicture: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetBlogsResponse {
  blogs: BlogWithAuthor[];
}

export interface GetBlogResponse {
  blog: BlogWithAuthor;
}
