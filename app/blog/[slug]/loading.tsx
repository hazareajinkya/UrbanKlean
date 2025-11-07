export default function Loading() {
  return (
    <div className="min-h-screen bg-background ">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="h-4 bg-muted rounded-md w-32 mb-6" />
          <div className="h-12 bg-muted rounded-md w-3/4 mb-6" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-md w-1/3" />
              <div className="h-3 bg-muted rounded-md w-1/4" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="relative w-full h-96 sm:h-[500px] mb-12 rounded-lg overflow-hidden bg-muted" />

        <article className="space-y-4">
          <div className="h-6 bg-muted rounded-md w-full" />
          <div className="h-6 bg-muted rounded-md w-5/6" />
          <div className="h-6 bg-muted rounded-md w-full" />
          <div className="h-6 bg-muted rounded-md w-4/5" />
          <div className="h-6 bg-muted rounded-md w-full mt-8" />
          <div className="h-6 bg-muted rounded-md w-5/6" />
        </article>

        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-muted rounded-md w-1/3" />
              <div className="h-4 bg-muted rounded-md w-full" />
              <div className="h-4 bg-muted rounded-md w-5/6" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
