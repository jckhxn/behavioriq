# UpgradePlan.tsx Accessibility & Event Tracking QA Checklist

## Accessibility

- [ ] All buttons and links have descriptive text
- [ ] Modal dialog uses appropriate ARIA roles (`role="dialog"`, `aria-modal="true"`)
- [ ] Modal can be closed with keyboard (Escape key, Cancel button)
- [ ] Focus is trapped within modal when open
- [ ] Badges (e.g., "Best Value") have `aria-label` for screen readers
- [ ] Credit bar uses `aria-valuenow`, `aria-valuemax`, and `aria-label`
- [ ] All form controls (checkboxes, inputs) have associated labels
- [ ] Sufficient color contrast for text and interactive elements
- [ ] Responsive layout works for screen readers and mobile devices

## Event Tracking

- [ ] "Add One-Time Report" CTA fires GA4 event with correct params
- [ ] "Upgrade to [Plan]" button fires GA4 event with correct params
- [ ] "Confirm Upgrade" fires GA4 event with correct params, including top-up status
- [ ] No TypeScript errors in event tracking code
- [ ] All event params use available plan properties (plan, monthlyCents, annualCents, credits, rollover_cap, top_up)
- [ ] No duplicate or missing events for user actions

---

**Automated Test Suggestions:**

- Use React Testing Library to simulate clicks and check that `window.dataLayer.push` is called with expected params
- Test keyboard navigation and focus management in modal
- Validate ARIA attributes and labels with axe-core or jest-axe
- Test mobile layout with viewport resizing

**Manual QA Steps:**

- Tab through all interactive elements and verify focus order
- Open modal, check focus trap, and close with Escape
- Use screen reader to verify labels and announcements
- Check color contrast with browser dev tools
- Trigger all CTAs and verify GA4 events in browser console
