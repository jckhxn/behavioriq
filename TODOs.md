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
  - User isn't created after successful payment
  - [x] **FIXED: Payment-First Registration Flow** ✅ COMPLETE (Sept 30, 2025)
    - Accounts are now created ONLY after successful Stripe payment
    - Trial users register → go to anonymous checkout → payment → account creation via webhook
    - No more "zombie accounts" without payment
    - Users get redirected to login page after successful payment

- Drag and Drop on dashboard?
- Test Stripe Payment Flow.
- After purchase user should be logged in so theyre sent straight to dashboard.
- Fancy tutorial onboarding for dashboard?
- Registered users get convo assessment upsell stuff on dashboard, follows similiar flow to trial flow (still WIP)
- Get rid of trial assessment banner if one has been taken.
- Add annual subscription plan (Consult ACQ AI on pricing)

# BUGS

- Results page inaccurately shows data.
- Domains on FULL Assessment all say Anti Social again.

  # Double Check things it said it did lol

# Features to add

- Analytics (Google & Meta Pixel for retargeting?)
- Account Upgrade
- Conversational AI Asssessment Taking for Kids.
- Trial Convo AI (mock AI responses, no API actually used.)
- SIS/PowerSchool integration (Import Students, select Student at assessment start, link in SIS system flow.)
- pSEO stuff
- Stripe
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
