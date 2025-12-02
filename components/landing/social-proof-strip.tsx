"use client";

export const SocialProofStrip = () => {
  const logos = [
    { name: "Company 1", width: 120 },
    { name: "Company 2", width: 100 },
    { name: "Company 3", width: 110 },
    { name: "Company 4", width: 90 },
    { name: "Company 5", width: 130 },
    { name: "Company 6", width: 100 },
  ];

  return (
    <section className="w-full py-12 bg-muted/50 border-y border-x">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by leading companies worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="h-8 bg-muted-foreground/20 rounded"
              style={{ width: logo.width }}
              aria-label={logo.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
