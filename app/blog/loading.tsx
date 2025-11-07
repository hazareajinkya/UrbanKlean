export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-1/3 mb-2" />
          <div className="h-6 bg-muted rounded-lg w-2/3" />
        </div>

        <div className="space-y-12">
          {[...Array(4)].map((_, i) => (
            <div
              className="group flex flex-col gap-6 pb-12 border-b border-border last:border-b-0 animate-pulse"
              key={i}
            >
              <div className="relative w-full h-64 sm:h-80 overflow-hidden rounded-lg bg-muted" />

              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <div className="h-10 bg-muted rounded-md w-3/4" />
                  <div className="h-6 bg-muted rounded-md w-full" />
                  <div className="h-6 bg-muted rounded-md w-5/6" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-md w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
