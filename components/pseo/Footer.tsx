export interface FooterProps {
  text: string;
  links: { label: string; href: string }[];
}

export function Footer({ text, links }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-10 text-sm">
      <p className="max-w-3xl mx-auto px-6">{text}</p>
      <div className="mt-2 flex justify-center gap-4 text-blue-400">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
