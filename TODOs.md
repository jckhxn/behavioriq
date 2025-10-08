# Features, bugs, TODOs, etc

(Features should follow this https://chatgpt.com/share/68c893a7-75f4-8012-bbe0-72404438f878)

# BUGS

- Clean up entire codebase for unused code.
  -- Cleanup repo of all those markdown files and scripts

# Features to add

- Clear local storage because trial answers persist?
- Domain Template Organization by type?
- Super Admin should be able to create new trial assessments.
- Dynamically load the info on trial what to expect section.
- Support different 0Auth providers.
- MFA for logins
- Email "Service" for sending report emails, for notifications, etc.
- Logic for Pro Plan Convo Allotments.
- Trial questions should maybe match assessment so progress carries over
- Implement District Admin Signup Links.
- - Signup invite via email or link
- Pick auth providers
- May need to work on how AI Prompt receives assessment results and incl. domain resources.
- Admins can create signup links for their distict license
- Cloudflare Email (When its released if its cost efficient)
- - AWS SES, Resend, MailGun, SendGrid, look up alternatives
- - Email Engine Setup (Auth, Reports, Marketing Sequencing stuff.)
    -- Districts should be able to create/manage etc assessments for users under their account/license.
- Drag and Drop components on dashboard?

- Analytics (Google & Meta Pixel for retargeting?)
- SIS/PowerSchool integration (Import Students, select Student at assessment start, link in SIS system flow.)
- pSEO stuff (https://docs.google.com/document/d/e/2PACX-1vTFgkhHVLh2MVU05EIdV1feAFZXljeFbRZEvz24Sl3oSUR-m1VwMQlmlAV_n8B2WZQReGcKEwoFjput/pub, pSEO ChatGPT chat)
- Affiliate linking setup
- Each domain can have a reccommended resources list with cited sources
- - This ensures the AI always provides the correct resources.
- Resources section (Saved from AI and a library we provide.)

# Features to consider

Enhanced Reports (already partially implemented)

# Determinations

- Cost of AI use
- Basis on what to charge.

# User Story

Logs in,
Answers yes/no questions
If a criteria isn't met it skips domain
Gives per domain score on graph.
Scores are given to AI and a response with reccomendations and citations are given underneath visual repersentation of assessment.
