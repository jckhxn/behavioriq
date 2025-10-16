export interface SocialProofSectionProps {
  heading: string;
  items: string[];
}

export function SocialProofSection({
  heading,
  items,
}: SocialProofSectionProps) {
  return (
    <section className="bg-gray-50 py-16 text-center">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">{heading}</h2>
      <div className="flex flex-wrap justify-center gap-8 text-gray-500">
        {items.map((item, idx) => {
          // If item looks like an image filename, render as image
          if (
            typeof item === "string" &&
            (item.endsWith(".png") ||
              item.endsWith(".jpg") ||
              item.endsWith(".jpeg") ||
              item.endsWith(".svg"))
          ) {
            const src = item.startsWith("/") ? item : `/${item}`;
            return (
              <img
                key={item}
                src={src}
                alt={item.replace(/\.[a-zA-Z]+$/, "")}
                className="h-10 w-auto object-contain"
                loading="lazy"
              />
            );
          }
          // Otherwise render as text
          return (
            <span key={item} className="uppercase tracking-wide text-sm">
              {item}
            </span>
          );
        })}
      </div>
    </section>
  );
}
