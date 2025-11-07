import { blogService } from "@/lib/services/blog-service";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import Script from "next/script";

export const revalidate = 60 * 60 * 24;

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Magical CX";
  const canonicalUrl = blog.canonicalUrl || `${baseUrl}/blog/${blog.slug}`;
  const ogImage =
    blog.ogImage || blog.featuredImage || `${baseUrl}/default-og.jpg`;
  const metaTitle = blog.metaTitle || blog.title;
  const metaDescription = blog.metaDescription || blog.excerpt || "";

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: blog.metaKeywords,
    authors: [
      {
        name: blog.author.name,
        url: blog.author.profilePicture,
      },
    ],
    category: blog.categories?.[0] || "Blog",
    robots: {
      index: blog.status === "published",
      follow: true,
      googleBot: {
        index: blog.status === "published",
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: siteName,
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
      tags: blog.tags,
      section: blog.categories?.[0],
      images: [
        {
          url: ogImage,
          alt: metaTitle,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
      creator: blog.author.name,
    },
    alternates: {
      canonical: canonicalUrl,
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Magical CX";
  const canonicalUrl = blog.canonicalUrl || `${baseUrl}/blog/${blog.slug}`;
  const ogImage =
    blog.ogImage || blog.featuredImage || `${baseUrl}/default-og.jpg`;
  const metaTitle = blog.metaTitle || blog.title;
  const metaDescription = blog.metaDescription || blog.excerpt || "";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metaTitle,
    description: metaDescription,
    image: ogImage,
    author: {
      "@type": "Person",
      name: blog.author.name,
      image: blog.author.profilePicture,
      url: blog.author.profilePicture,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    ...(blog.categories &&
      blog.categories.length > 0 && {
        articleSection: blog.categories[0],
      }),
    ...(blog.tags &&
      blog.tags.length > 0 && {
        keywords: blog.tags.join(", "),
      }),
    ...(blog.readingTime && {
      timeRequired: `PT${blog.readingTime}M`,
    }),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: metaTitle,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Script
        id="blog-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            aria-label="Back to blog listing"
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
              alt={`${blog.author.name}'s profile picture`}
              width={48}
              height={48}
              className="rounded-full w-12 h-12"
            />
            <div>
              <p className="font-medium text-foreground">{blog.author.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={blog.publishedAt || blog.createdAt}>
                  {new Date(
                    blog.publishedAt || blog.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {blog.readingTime && (
                  <>
                    <span>•</span>
                    <span>{blog.readingTime} min read</span>
                  </>
                )}
              </div>
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
