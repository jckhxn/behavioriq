export interface ComparisonSectionProps {
  heading: string;
  rows: { label: string; traditional: string; behavioriq: string }[];
}

export function ComparisonSection({ heading, rows }: ComparisonSectionProps) {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
        {heading}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-gray-700">
          <thead>
            <tr>
              <th className="border-b p-4"></th>
              <th className="border-b p-4 font-bold text-gray-900">
                Traditional
              </th>
              <th className="border-b p-4 font-bold text-blue-700">
                BehaviorIQ™
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="p-4 font-medium text-gray-900">{row.label}</td>
                <td className="p-4">{row.traditional}</td>
                <td className="p-4 text-blue-700 font-semibold">
                  {row.behavioriq}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
