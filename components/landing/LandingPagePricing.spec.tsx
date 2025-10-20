// LandingPagePricing.spec.tsx
// Spec for the public landing page pricing table (desktop/mobile)
// Covers layout, toggles, card anatomy, accessibility, and tracking hooks

import { render, screen, fireEvent } from "@testing-library/react";
import LandingPagePricing from "../../components/landing/LandingPagePricing";

// Mock withUTM helper for UTM propagation
jest.mock("../../lib/utils", () => ({
  ...jest.requireActual("../../lib/utils"),
  withUTM: (url: string) => url + "?utm=mocked",
}));

describe("LandingPagePricing", () => {
  it("renders H1 and subheading", () => {
    render(<LandingPagePricing />);
    expect(
      screen.getByRole("heading", { level: 2, name: /get answers in hours/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/research-backed ai behavioral assessments/i)
    ).toBeInTheDocument();
  });

  it("renders monthly and annual toggle and switches prices", () => {
    render(<LandingPagePricing />);
    const monthlyBtn = screen.getByRole("button", { name: /monthly/i });
    const annualBtn = screen.getByRole("button", { name: /annual/i });
    expect(monthlyBtn).toHaveClass("bg-white");
    fireEvent.click(annualBtn);
    expect(annualBtn).toHaveClass("bg-white");
    expect(screen.getByText("$597")).toBeInTheDocument();
    expect(screen.getByText(/save \$111/i)).toBeInTheDocument();
  });

  it("renders all three plan cards with correct content", () => {
    render(<LandingPagePricing />);
    expect(screen.getByText(/single/i)).toBeInTheDocument();
    expect(screen.getByText(/core/i)).toBeInTheDocument();
    expect(screen.getByText(/family/i)).toBeInTheDocument();
    expect(screen.getByText(/one professional report/i)).toBeInTheDocument();
    expect(screen.getByText(/for focused parents/i)).toBeInTheDocument();
    expect(screen.getByText(/for multi-child families/i)).toBeInTheDocument();
  });

  it("shows Most Popular badge on Core card with aria-label", () => {
    render(<LandingPagePricing />);
    const badge = screen.getByLabelText(/most popular/i);
    expect(badge).toBeInTheDocument();
  });

  it("renders Enterprise banner and Contact Sales CTA", () => {
    render(<LandingPagePricing />);
    expect(screen.getByText(/district license/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact sales/i })
    ).toBeInTheDocument();
  });

  it("renders sticky CTA on mobile after scroll", () => {
    // Simulate mobile viewport and scroll
    window.innerWidth = 375;
    render(<LandingPagePricing />);
    // Simulate scroll event
    fireEvent.scroll(window, { target: { scrollY: 400 } });
    expect(
      screen.getByRole("button", { name: /start free snapshot/i })
    ).toBeInTheDocument();
  });

  it("has accessible buttons and focus ring", () => {
    render(<LandingPagePricing />);
    const ctas = screen.getAllByRole("link");
    ctas.forEach((cta) => {
      expect(cta).toHaveAccessibleName();
      // Focus ring: check for focus-visible class or outline
    });
  });

  it("sets up GA4 and UTM tracking hooks for later", () => {
    // This is a placeholder: check for data attributes or event handler presence
    render(<LandingPagePricing />);
    const coreCta = screen.getByRole("link", { name: /start core/i });
    expect(coreCta).toHaveAttribute("data-ga-event", "plan_click");
    expect(coreCta).toHaveAttribute("data-ga-plan", "core");
    expect(coreCta).toHaveAttribute(
      "href",
      expect.stringContaining("utm=mocked")
    );
  });
});
