# Features, bugs, TODOs, etc

(Features should follow this https://chatgpt.com/share/68c893a7-75f4-8012-bbe0-72404438f878)

# BUGS

- Enhanced reports or reports dont load on /share/
- Password field doesnt have show password on trial checkout page.
- URL issue when navigating to billing -> upgrade and back to dashboard.
- Previous button on resume doesnt work on dashboard.
- Dashboard on Mobile is whacky.

# Features to add

- Password Reset
- Email/Magic Link
- Logic for Pro Plan Convo Allotments.
- Trial questions should maybe match assessment so progress carries over
- Implement District Admin Signup Links.
- - Signup invite via email or link
- Pick auth providers
- Convo AI -> Basic Report -> Enhanced Report flow.
- May need to work on how AI Prompt receives assessment results and incl. domain resources.
- Admins can create signup links for their distict license
- Cloudflare Email (When its released if its cost efficient)
- - AWS SES, Resend, MailGun, SendGrid, look up alternatives
- - Email Engine Setup (Auth, Reports, Marketing Sequencing stuff.)
    -- Districts should be able to create/manage etc assessments for users under their account/license.
- Drag and Drop components on dashboard?

- Analytics (Google & Meta Pixel for retargeting?)
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
