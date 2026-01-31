import { blogService } from "@/lib/services/blog-service";
import { ChevronRight, Sparkles } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import Script from "next/script";
import BlogShareSidebar from "@/components/blog/blog-share-sidebar";
import type { BlogFaq, BlogWithAuthor } from "@/lib/types/blog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const revalidate = 86400;

export async function generateStaticParams() {
  const { blogs }: { blogs: BlogWithAuthor[] } =
    await blogService.getAllBlogs();
  return blogs.map((blog: { slug: string }) => ({ slug: blog.slug }));
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
    authors: [{ name: blog.author.name }],
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
  const { blogs }: { blogs: BlogWithAuthor[] } =
    await blogService.getAllBlogs();
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
  const tagPool = new Set(
    [...(blog.tags || []), ...(blog.categories || [])].map((tag) =>
      tag.toLowerCase(),
    ),
  );
  const relatedBlogs = blogs
    .filter(
      (item) =>
        item.slug !== blog.slug &&
        (item.tags?.some((tag: string) => tagPool.has(tag.toLowerCase())) ||
          item.categories?.some((tag: string) =>
            tagPool.has(tag.toLowerCase()),
          )),
    )
    .slice(0, 3);
  const fallbackBlogs = blogs
    .filter((item) => item.slug !== blog.slug)
    .slice(0, 3);
  const recommendedBlogs = relatedBlogs.length ? relatedBlogs : fallbackBlogs;

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
      ...(blog.author.description && { description: blog.author.description }),
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
  const faqStructuredData = blog.faqs?.length && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: blog.faqs.map((faq: BlogFaq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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
    <div className="section-container border-x min-h-screen">
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
      {faqStructuredData ? (
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      ) : null}

      <div className="w-full">
        <header className="px-4 py-8 md:px-10 md:py-12 border-b">
          <div className="max-w-4xl mt-10">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-sm min-w-0"
              >
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Home"
                >
                  Home
                </Link>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Blog"
                >
                  Blog
                </Link>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  className="text-foreground truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {metaTitle}
                </span>
              </nav>
              <div className="md:hidden w-fit max-w-full">
                <BlogShareSidebar
                  url={canonicalUrl}
                  title={metaTitle}
                  description={metaDescription}
                  content={blog.content}
                />
              </div>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl md:text-balance leading-[1.2] text-foreground font-medium">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="sm:text-lg text-base mt-5 text-balance text-muted-foreground leading-relaxed">
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
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <time dateTime={blog.publishedAt || blog.createdAt}>
                    {new Date(
                      blog.publishedAt || blog.createdAt,
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
          <div className="relative w-full aspect-[21/9] overflow-hidden ">
            <Image
              src={blog.featuredImage || "/placeholder.svg"}
              alt={blog.title}
              fill
              loading="eager"
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-12 px-4 py-8 sm:py-12 max-w-6xl mx-auto">
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
          <article className="flex-1 min-w-0">
            {blog.keyTakeaway && (
              <section aria-label="Key takeaway" className="mb-8">
                <div className="rounded-2xl bg-gradient-to-r from-red-500/70 via-orange-400/70 to-yellow-300/70 p-[2px]">
                  <div className="rounded-[calc(theme(borderRadius.2xl)-2px)] bg-gradient-to-br from-background via-background to-orange-50/40 p-6">
                    <div className="flex items-center gap-2 text-base md:text-lg font-medium text-foreground">
                      <Sparkles
                        className="h-5 w-5 text-orange-400"
                        aria-hidden="true"
                      />
                      <p>Summary by MagicalCX AI</p>
                    </div>
                    <p className="mt-3 text-base md:text-lg text-foreground leading-relaxed">
                      {blog.keyTakeaway}
                    </p>
                  </div>
                </div>
              </section>
            )}
            <div className="prose prose-neutral prose-base md:prose-lg prose-img:rounded-xl prose-a:underline-offset-2 prose-a:underline prose-a:text-primary prose-a:hover:text-primary/80 dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent.toString() }}
              />
            </div>
          </article>
        </div>
      </div>
      {blog.faqs?.length ? (
        <section className="border-t">
          <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-12 max-w-6xl mx-auto px-4 py-8 sm:py-12">
            <aside
              className="lg:w-64 shrink-0 hidden lg:block"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-medium text-foreground">
                FAQs
              </h2>
              <Accordion type="single" collapsible className="mt-6 space-y-0">
                {blog.faqs.map((faq: BlogFaq, index: number) => (
                  <AccordionItem
                    key={`${blog.id}-faq-${index}`}
                    value={`faq-${index}`}
                    className="border-b border-border last:border-none"
                  >
                    <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:no-underline py-6 transition-colors cursor-pointer">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      ) : null}
      {recommendedBlogs.length > 0 && (
        <section className="border-t">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 pb-14 sm:pb-16">
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              Related posts
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y rounded-none overflow-hidden">
              {recommendedBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col bg-card hover:bg-muted/50 transition-colors duration-300 h-full"
                  aria-label={`Read ${item.title}`}
                >
                  {item.featuredImage && (
                    <div className="relative w-full aspect-video overflow-hidden bg-muted border-b">
                      <Image
                        src={item.featuredImage || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
                      <span>
                        {new Date(
                          item.publishedAt || item.createdAt,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {item.readingTime && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>{item.readingTime} min read</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-4 line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
