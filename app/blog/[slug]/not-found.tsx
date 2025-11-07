import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 dark">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-muted-foreground opacity-30">
            404
          </h1>
          <h2 className="text-4xl font-semibold text-foreground text-balance">
            Page Not Found
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
