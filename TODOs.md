# Features, bugs, TODOs, etc

(Features should follow this https://chatgpt.com/share/68c893a7-75f4-8012-bbe0-72404438f878)

- Add social proof (where asssessments come from, parents/school testimonials)
- May need to work on how AI Prompt receives assessment results and incl. domain resources.
  Autofill bug when creating share links
- Dialog when deleting share links.
- Admins can create signup links for their distict license
- Cloudflare Email (When its released if its cost efficient)
- - AWS SES, Resend, MailGun, SendGrid, look up alternatives
- - Email Engine Setup (Auth, Reports, Marketing Sequencing stuff.)
    -- Districts should be able to create/manage etc assessments for users under their account/license.
    - Users get redirected to login page after successful payment

- Drag and Drop components on dashboard?
- After purchase user should be logged in so theyre sent straight to dashboard.
- Fancy tutorial onboarding for dashboard?
- Get rid of trial assessment banner if one has been taken.
- [x] **DONE: Annual Subscription Plan** ✅ COMPLETE (Oct 2, 2025)
  - Added $290/year subscription option (save $58/year)
  - Includes 3 FREE Conversational AI sessions
  - Displayed on landing page pricing section
  - Stripe price ID configured: STRIPE_ANNUAL_PRICE_ID
- - Free (View Only) account.
- Account Upgrade from dashboard or redirect to checkout if coming from landing page.
- - Pricing should reflect config.

# BUGS

- Results page inaccurately shows data (Clicking yes on every trial question says 14 out of 7 for example)
- No validation that email already exists on registration after trial (or post checkout.)
- Failed to process upgrade when attempting account upgrade on post checkout screen
- /share/ route doesn't load enhanced reports correctly.
- Hide "View Enhanced report" after enhanced report viewed.
- Account upgrade from dash doesnt work?
- Implement District Admin Signup Links.

  # Double Check things it said it did lol

# Features to add

- Analytics (Google & Meta Pixel for retargeting?)
- Account Upgrade from dashboard.
- SIS/PowerSchool integration (Import Students, select Student at assessment start, link in SIS system flow.)
- pSEO stuff
- Affiliate linking setup
- Each domain can have a reccommended resources list with cited sources
- - This ensures the AI always provides the correct resources.
- Resources section (Saved from AI and a library we provide.)

# Determinations

- Cost of AI use
- Basis on what to charge.

# User Story

Logs in,
Answers yes/no questions
If a criteria isn't met it skips domain
Gives per domain score on graph.
Scores are given to AI and a response with reccomendations and citations are given underneath visual repersentation of assessment.
