import { blogService } from "@/lib/services/blog-service";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
export const revalidate = 60;

export async function generateStaticParams() {
  const { blogs } = await blogService.getAllBlogs();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await blogService.getBlogBySlug(slug);
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.metaKeywords?.join(", "),
    authors: [
      {
        name: blog.author.name,
        url: blog.author.profilePicture,
      },
    ],
    category: blog.categories?.[0] || "Blog",
    openGraph: {
      type: "article",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      url:
        blog.canonicalUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${blog.slug}`,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Magical CX",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
      tags: blog.tags,
      images: [
        {
          url: blog.ogImage || blog.featuredImage || "/default-og.jpg",
          alt: blog.metaTitle || blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: [blog.ogImage || blog.featuredImage || "/default-og.jpg"],
      creator: blog.author.name,
    },
    alternates: {
      canonical:
        blog.canonicalUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${blog.slug}`,
    },

    other: {
      "script:type": "application/ld+json",
      "script:innerHTML": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.excerpt,
        image: blog.ogImage || blog.featuredImage || "/default-og.jpg",
        author: {
          "@type": "Person",
          name: blog.author.name,
          url: blog.author.profilePicture,
        },
        publisher: {
          "@type": "Organization",
          name: process.env.NEXT_PUBLIC_SITE_NAME || "Magical CX",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
          },
        },
        datePublished: blog.publishedAt,
        dateModified: blog.updatedAt,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": blog.canonicalUrl,
        },
      }),
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await blogService.getBlogBySlug(slug);
  const htmlContent = await remark()
    .use(html, { sanitize: false })
    .process(blog.content);

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <span>
              <ArrowLeft />
            </span>
            <span>Back to Blog</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4">
            <Image
              src={blog.author.profilePicture || "/placeholder.svg"}
              alt={blog.author.name}
              width={48}
              height={48}
              className="rounded-full w-12 h-12"
            />
            <div>
              <p className="font-medium text-foreground">{blog.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(
                  blog.publishedAt || blog.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full ">
        {blog.featuredImage && (
          <div className="relative w-full h-96 sm:h-[500px] mb-12 rounded-lg overflow-hidden">
            <Image
              src={blog.featuredImage || "/placeholder.svg"}
              alt={blog.title}
              fill
              loading="eager"
              className="object-cover"
              priority
            />
          </div>
        )}

        <article className=" prose-sm prose md:prose-base dark:prose-invert w-full max-w-5xl ">
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent.toString() }}
            className="w-full"
          />
        </article>
      </main>
    </div>
  );
}
