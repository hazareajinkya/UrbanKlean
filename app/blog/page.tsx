import { blogService } from "@/lib/services/blog-service";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Explore the latest blog posts, tutorials, and news from Magical CX.",
  openGraph: {
    title: "Blog",
    description:
      "Explore the latest blog posts, tutorials, and news from Magical CX.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
};

export default async function BlogListPage() {
  const { blogs } = await blogService.getAllBlogs();

  return (
    <div className="min-h-screen bg-card">
      <div className="max-w-7xl mx-auto min-h-screen px-4 ">
        <div className=" py-6 sm:py-8 lg:py-10 mt-5">
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font- tracking-tight leading-tight">
              Exploring New Blogs
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed tracking-normal">
              Thoughts on web development, design, and technology.
            </p>
          </div>
        </div>

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group flex flex-col  transition-colors hover:bg-muted/30"
              >
                {blog.featuredImage && (
                  <div className="relative w-full aspect-video  overflow-hidden bg-muted">
                    <Image
                      src={blog.featuredImage || "/placeholder.svg"}
                      alt={blog.title}
                      fill
                      className="object-cover opacity-100 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3 py-6 sm:py-7 flex-1">
                  <h2 className="text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors  leading-snug tracking-tight">
                    {blog.title}
                  </h2>
                  {/* <p className="text-sm sm:text-base text-muted-foreground">
                    {blog.excerpt}
                  </p> */}
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <div className="flex items-center gap-2">
                      {/* <Calendar className="h-4 w-4 flex-shrink-0" /> */}
                      <span className="leading-normal">
                        {new Date(
                          blog.publishedAt || blog.updatedAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {blog.readingTime && (
                      <div className="flex items-center gap-2">
                        {/* <Clock className="h-4 w-4 flex-shrink-0" /> */}
                        <span className="leading-normal">
                          {blog.readingTime} min
                        </span>
                      </div>
                    )}
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
