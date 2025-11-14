import { blogService } from "@/lib/services/blog-service";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import Script from "next/script";
import BlogShareSidebar from "@/components/blog/blog-share-sidebar";

export const revalidate = 86400;

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
    .use(remarkGfm)
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
    <div className="bg-card">
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
      {/* border-l border-r */}
      <div className="min-h-screen max-w-5xl mx-auto ">
        <div className="max-w-7xl mx-auto  min-h-screen">
          <header className="px-4 xl:px-6 py-8 sm:py-12 border-b">
            <div>
              <div className="flex justify-between items-center  mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                  aria-label="Back to blog listing"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Blog</span>
                </Link>
                <div className="md:hidden">
                  <BlogShareSidebar
                    url={canonicalUrl}
                    title={metaTitle}
                    description={metaDescription}
                    content={blog.content}
                  />
                </div>
              </div>
              <h1 className="mt-4 max-w-5xl text-3xl sm:text-4xl lg:text-5xl md:text-balance leading-[1.2] text-foreground">
                {blog.title}
              </h1>
              {blog.excerpt && (
                <p className="sm:text-lg text-base  mt-5 text-balance text-muted-foreground max-w-5xl leading-relaxed">
                  {blog.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 mt-6 sm:mt-8">
                <Image
                  src={blog.author.profilePicture || "/placeholder.svg"}
                  alt={`${blog.author.name}'s profile picture`}
                  width={48}
                  height={48}
                  className="rounded-full w-12 h-12 object-cover border-2 border-border"
                />
                <div>
                  <p className="font-medium text-foreground">
                    {blog.author.name}
                  </p>
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

          {blog.featuredImage && (
            <div className="relative w-full h-full aspect-[16/9] overflow-hidden border-b">
              <Image
                src={blog.featuredImage || "/placeholder.svg"}
                alt={blog.title}
                fill
                loading="eager"
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (  max-width: 1200px) 100vw, 1280px"
              />
            </div>
          )}

          <div className="flex flex-col border lg:flex-row-reverse gap-2 lg:gap-12 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-24 hidden md:block">
                <BlogShareSidebar
                  url={canonicalUrl}
                  title={metaTitle}
                  description={metaDescription}
                  content={blog.content}
                />
              </div>
            </aside>
            <article className="flex-1 mx-auto max-w-prose  min-w-0">
              <div className="prose prose-neutral prose-base md:prose-lg prose-img:rounded-xl prose-a:underline-offset-2 prose-a:underline prose-a:text-blue-600 prose-a:hover:text-primary/80 dark:prose-invert max-w-none  prose-h2:my-0 prose-h2:mb-7">
                <div
                  dangerouslySetInnerHTML={{ __html: htmlContent.toString() }}
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
