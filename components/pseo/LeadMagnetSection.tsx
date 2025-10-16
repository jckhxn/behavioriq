export interface LeadMagnetSectionProps {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  supportingText: string;
}

export function LeadMagnetSection({
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  supportingText,
}: LeadMagnetSectionProps) {
  return (
    <section className="bg-blue-600 text-white py-20 text-center">
      <h2 className="text-3xl font-bold mb-4">{heading}</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">{subheading}</p>
      <a
        href={ctaHref}
        className="bg-white text-blue-700 px-10 py-4 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-all"
      >
        {ctaLabel}
      </a>
      <p className="text-sm mt-4 text-blue-100 max-w-xl mx-auto">
        {supportingText}
      </p>
    </section>
  );
}
