import { blogService } from "@/lib/services/blog-service";
import { MetadataRoute } from "next";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const { blogs } = await blogService.getAllBlogs();

  const blogUrls = blogs.map((b: any) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.updatedAt || b.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Static public routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: "daily" as const,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools/customer-support-and-refund-policy-generator`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools/customer-support-cost-calculator`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools/ai-vs-human-support-roi-calculator`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools/refund-risk-predictor`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },

    {
      url: `${baseUrl}/free-tools/customer-support-tone-checker`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/free-tools/customer-support-response-grader`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
    {
      url: `${baseUrl}/legal/refund`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: "yearly" as const,
    },
  ];

  return [...staticRoutes, ...blogUrls];
}
