import { blogService } from "@/lib/services/blog-service";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Explore the latest blog posts, tutorials, and news from Magical CX.",
  openGraph: {
    title: "Blog ",
    description:
      "Explore the latest blog posts, tutorials, and news from  Magical CX.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
};

export default async function BlogListPage() {
  const { blogs } = await blogService.getAllBlogs();

  if (blogs.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            No Blogs Yet
          </h1>
          <p className="text-lg text-muted-foreground">
            Check back soon for new articles and updates.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Thoughts on web development, design, and technology.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="group flex flex-col gap-6 pb-12 border-b border-border last:border-b-0 hover:opacity-75 transition-opacity"
            >
              {blog.featuredImage && (
                <div className="relative w-full h-64 sm:h-80 overflow-hidden rounded-lg">
                  <Image
                    src={blog.featuredImage || "/placeholder.svg"}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Image
                    src={blog.author.profilePicture || "/placeholder.svg"}
                    alt={blog.author.name}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10"
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {blog.author.name}
                    </span>
                    <span>·</span>
                    <time>
                      {new Date(
                        blog.publishedAt || blog.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
