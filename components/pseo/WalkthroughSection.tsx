export interface WalkthroughSectionProps {
  heading: string;
  steps: { step: string; title: string; description: string }[];
}

export function WalkthroughSection({
  heading,
  steps,
}: WalkthroughSectionProps) {
  return (
    <section className="bg-blue-50 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10 text-gray-900">{heading}</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((card) => (
            <div
              key={card.step}
              className="bg-white shadow-lg p-8 rounded-2xl hover:shadow-xl transition-all"
            >
              <h3 className="text-4xl font-bold text-blue-600 mb-4">
                {card.step}
              </h3>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                {card.title}
              </h4>
              <p className="text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
