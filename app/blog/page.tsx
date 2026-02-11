import { blogService } from "@/lib/services/blog-service";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { coreConf } from "@/lib/utils/conf";
import type { BlogWithAuthor } from "@/lib/types/blog";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Blog | MagicalCX",
  description:
    "Practical guides and insights on empathy-first customer service, AI support automation, and building support systems that scale.",
  openGraph: {
    title: "Blog | MagicalCX",
    description:
      "Practical guides and insights on empathy-first customer service, AI support automation, and building support systems that scale.",
    url: `${coreConf.baseUrl}/blog`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/blog`,
  },
};

export default async function BlogListPage() {
  const { blogs }: { blogs: BlogWithAuthor[] } =
    await blogService.getAllBlogs();

  return (
    <div className="">
      <div className="section-container border-x flex flex-col items-center text-center py-16 sm:py-20 lg:py-24 px-4">
        <h1 className="section-heading">The MagicalCX Blog</h1>
        <p className="section-subheadline">
          Thoughtful writing on empathy-first customer service, AI-powered
          support, and building better customer relationships.
        </p>
      </div>

      <div className="section-container border-x pb-20">
        {!blogs ? (
          <div className="flex flex-col items-center justify-center min-h-96 px-4 sm:px-6 lg:px-8 border-b border-r border-border">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                No blog posts yet
              </h2>
              <p className="text-base text-muted-foreground max-w-md">
                Check back soon for insightful articles on web development,
                design, and technology.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y rounded-none overflow-hidden">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group flex flex-col bg-card hover:bg-muted/50 transition-colors duration-300 h-full"
              >
                {blog.featuredImage && (
                  <div className="relative w-full aspect-video overflow-hidden bg-muted border-b">
                    <img
                      src={blog.featuredImage || "/placeholder.svg"}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6 md:p-8">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
                    <span>
                      {new Date(
                        blog.publishedAt || blog.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {blog.readingTime && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span>{blog.readingTime} min read</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-4 line-clamp-2">
                    {blog.title}
                  </h2>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={blog.author.profilePicture || "/placeholder.svg"}
                        alt=""
                        width={24}
                        height={24}
                        className="rounded-full w-6 h-6 object-cover border border-border shrink-0"
                      />
                      <span className="text-sm text-muted-foreground truncate">
                        {blog.author.name}
                      </span>
                    </div>
                    <span className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                      Read Post <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
