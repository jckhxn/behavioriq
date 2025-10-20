import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UpgradePlan from "./UpgradePlan";

describe("UpgradePlan event tracking and accessibility", () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });
    (window as any).dataLayer = [];
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const defaultProps = {
    currentPlanId: "CORE",
    creditsAvailable: 3,
    rolloverCap: 6,
    nextCreditInDays: 5,
    conversationalAI: "$9 per session",
  };

  it("fires GA4 event on Add One-Time Report CTA", () => {
    render(<UpgradePlan {...defaultProps} />);
    fireEvent.click(screen.getByText(/Add One-Time Report/i));
    expect(
      (window as any).dataLayer.some(
        (event: any) => event.event === "add_report_click"
      )
    ).toBe(true);
  });

  it("fires GA4 event on Upgrade to [Plan] CTA", () => {
    render(<UpgradePlan {...defaultProps} />);
    const upgradeBtn = screen.getAllByText(/Upgrade to/i)[0];
    fireEvent.click(upgradeBtn);
    expect(
      (window as any).dataLayer.some(
        (event: any) => event.event === "upgrade_click"
      )
    ).toBe(true);
  });

  it("fires GA4 event on Confirm Upgrade CTA", () => {
    render(<UpgradePlan {...defaultProps} />);
    const upgradeBtn = screen.getAllByText(/Upgrade to/i)[0];
    fireEvent.click(upgradeBtn);
    const confirmBtns = screen.getAllByText(/Confirm Upgrade/i);
    // Find the button element (not heading)
    const confirmBtn = confirmBtns.find((el) => el.tagName === "BUTTON");
    fireEvent.click(confirmBtn!);
    expect(
      (window as any).dataLayer.some(
        (event: any) => event.event === "upgrade_confirm"
      )
    ).toBe(true);
  });

  it("has accessible credit bar with ARIA attributes", () => {
    render(<UpgradePlan {...defaultProps} />);
    const bar = screen.getByLabelText(/Credit balance bar/i);
    // @ts-expect-error: jest-dom matcher
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    // @ts-expect-error: jest-dom matcher
    expect(bar).toHaveAttribute("aria-valuemax", "6");
  });

  it("modal is keyboard accessible and can be closed", () => {
    render(<UpgradePlan {...defaultProps} />);
    const upgradeBtn = screen.getAllByText(/Upgrade to/i)[0];
    fireEvent.click(upgradeBtn);
    const cancelBtns = screen.getAllByText(/Cancel/i);
    // Find the button element (not paragraph)
    const cancelBtn = cancelBtns.find((el) => el.tagName === "BUTTON");
    fireEvent.click(cancelBtn!);
    // @ts-expect-error: jest-dom matcher
    expect(screen.queryByText(/Confirm Upgrade/i)).not.toBeInTheDocument();
  });

  it("fires upgrade_view telemetry on render", () => {
    render(<UpgradePlan {...defaultProps} />);
    expect(
      (window as any).dataLayer.some(
        (event: any) => event.event === "upgrade_view"
      )
    ).toBe(true);
  });
});
