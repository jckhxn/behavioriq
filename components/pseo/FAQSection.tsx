export interface FAQSectionProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  if (!faqs.length) return null;
  return (
    <section className="bg-white px-6 py-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
        Frequently Asked Questions
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((item) => (
          <div
            key={item.question}
            className="bg-gray-50 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.question}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
