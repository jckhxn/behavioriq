- Use GPT-4o mini model

- ai.config file tweaking (remove conversational assessment mode for now?)
- Assessments can be loaded into db
- Users can specify assessments/domains
- Upload asssessments from dashboard
- Admin can configure custom assessments based on modular domain questionaires?
- Upload Dashboard should allow for manual entry of all fields (name included) then sorted into an existing or new asssessment. You can uload an entire assessment or domain.
- ✅ Write docs on how to write assessments (See docs/ASSESSMENT_WRITING_GUIDE.md)
- Separate Knowledge Chat feature from app (Make sep project.)
- Remove backend knowledge uploading stuff and packages.
- Users that have not signed up get landing page -> Trial assessment with funnel into paid (PDF reports, etc)
  (Features should follow this https://chatgpt.com/share/68c893a7-75f4-8012-bbe0-72404438f878)

# Features to add

- PDF and AI SDk from https://github.com/midday-ai/midday?
- Resend
- Polar
- Plaid & Teller for bank connections?

- Diagnostic reports in PDF
- Send to email?
- Use Recharts for charts?
- One user per license
- Multiple users per license (Upcharge)
- Affiliate linking setup
- Conversational assessment mode (for kids)?

# Determinations

- Cost of AI use
- Basis on what to charge.

# User Story

Logs in,
Answers yes/no questions
If a criteria isn't met it skips domain
Gives per domain score on graph.
Scores are given to AI and a response with reccomendations and citations are given underneath visual repersentation of assessment.
