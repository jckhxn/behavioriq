export interface ContentSectionProps {
  heading: string;
  paragraphs: string[];
}

export function ContentSection({ heading, paragraphs }: ContentSectionProps) {
  return (
    <section className="px-6 py-16 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{heading}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-lg leading-relaxed text-gray-700 mb-4">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
