# AI Diagnostic Assessment Platform

A comprehensive Next.js 15 application for conducting structured behavioral assessments with AI-powered analysis, professional reporting, and enterprise-grade licensing management. Designed for clinical and research environments with robust analytics, email automation, and customizable assessment workflows.

## Features

### 🧠 Advanced Assessment System

- **Modular Assessment Framework**: Configurable domain-based assessments (currently featuring Early Detection Screener)
- **Intelligent Question Logic**: Gatekeeper questions with advanced skip logic and early termination rules
- **Real-time Scoring**: Live domain scoring with clinical threshold detection
- **Multi-Part Assessment Support**: Complex multi-stage assessments (e.g., Antisocial Personality with Part 1/Part 2 structure)
- **Assessment Upload System**: Admin capability to upload custom assessments via structured JSON
- **Progress Visualization**: Real-time line chart visualization using Recharts for completed assessments

### 📊 Assessment Domains (Early Detection Screener)

- **Antisocial Behavior**: 12 questions with age prerequisites and multi-part scoring logic
- **Violence Risk**: Comprehensive violence assessment with clinical thresholds
- **Attention Disorders**: ADHD and attention-related behavioral screening
- **Emotional Regulation**: Depression, anxiety, and emotional stability evaluation
- **Conduct Issues**: Rule-breaking behavior and authority conflicts assessment

### � Professional Reporting & Visualization

- **PDF Report Generation**: Professional assessment reports with jsPDF and canvas-based chart generation
- **Email Report Delivery**: Automated report distribution via Resend email service
- **Line Chart Visualization**: Assessment results displayed as line graphs for completed assessments
- **AI-Powered Recommendations**: GPT-4o-mini generated clinical insights and actionable recommendations
- **Customizable Report Options**: Include/exclude charts, recommendations, detailed responses, and trends
- **Organization Branding**: Custom logos and organization names in reports

### 🏢 Enterprise Licensing & User Management

- **Multi-Tier Licensing**: Trial, Basic, Professional, and Enterprise license types
- **Feature-Based Access Control**: License-driven feature restrictions (PDF reports, AI recommendations, bulk upload)
- **Organization Management**: Multi-user organizations with license pooling
- **Usage Metrics**: Track assessments, PDF reports, and API calls per user
- **License Expiration Management**: Automated notifications and renewal workflows
- **Admin License Assignment**: Centralized license distribution and user role management

### � Email Automation System

- **Assessment Report Emails**: Automated delivery of assessment results with optional PDF attachments
- **License Expiration Notifications**: 30-day advance warnings for expiring licenses
- **Welcome Emails**: New user onboarding with license information
- **Daily Digest**: Administrative summary emails with system statistics
- **Manual Email Jobs**: Admin-triggered email campaigns and notifications
- **Professional Email Templates**: HTML/text email templates with branding

### 📊 Analytics & Administration

- **System Analytics Dashboard**: Assessment trends, user activity, and license usage
- **Real-time Statistics**: Live metrics for assessments, users, and system performance
- **Assessment Management**: Admin oversight of all assessment sessions
- **User Administration**: Role management, license assignment, and activity monitoring
- **Email Settings**: Email service configuration and job management
- **Data Export**: Comprehensive reporting and data extraction capabilities

### 🔧 Assessment Configuration System

- **Custom Assessment Upload**: JSON-based assessment definition and import
- **Domain Configuration**: Modular question sets with scoring rules and termination logic
- **Question Set Management**: Create, modify, and activate assessment components
- **Clinical Threshold Settings**: Configurable scoring thresholds for clinical significance
- **Skip Logic Configuration**: Complex conditional question flow and early termination rules

## Tech Stack

- **Framework**: Next.js 15.5.3 with App Router and Turbopack
- **Database**: PostgreSQL 14+ with pgvector extension for semantic search
- **ORM**: Prisma 6.16.2 with full TypeScript support and preview features
- **Authentication**: NextAuth.js v5 (beta.29) with credentials provider
- **AI/ML**: OpenAI GPT-4o-mini + text-embedding-3-small for analysis and recommendations
- **UI Framework**: Tailwind CSS 4 + shadcn/ui components + Radix UI primitives
- **Charts & Visualization**: Recharts 2.15.4 with custom chart components
- **Email Service**: Resend 6.1.0 with React Email templates
- **PDF Generation**: jsPDF 3.0.3 with HTML5 Canvas chart rendering
- **File Processing**: pdf-parse, mammoth, xlsx, papaparse for multi-format support
- **Development**: TypeScript 5, ESLint, Prisma Studio, TSX for scripts

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ with pgvector extension
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-diagnostic
npm install
```

### 2. Database Setup

#### Install PostgreSQL and pgvector

**macOS (Homebrew):**

```bash
brew install postgresql@15
brew install pgvector
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo apt install postgresql-15-pgvector
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Docker (Alternative):**

```bash
docker run -d \
  --name postgres-pgvector \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_diagnostic \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and enable pgvector
CREATE DATABASE ai_diagnostic;
\c ai_diagnostic;
CREATE EXTENSION vector;
\q
```

### 3. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_diagnostic?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key-here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# File Upload
MAX_FILE_SIZE="10485760" # 10MB in bytes
UPLOAD_DIR="./uploads"

# Application
NODE_ENV="development"
```

### 4. Database Migration and Seeding

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## How to Use the Application

### 🔐 Getting Started

1. **Register/Login**: Create an account or use test credentials
2. **License Assignment**: Admin assigns appropriate license based on user needs
3. **Choose Assessment Type**: Select from available assessments or upload custom assessments
4. **Start Session**: Begin assessment with real-time progress tracking

### 📋 Conducting Assessments

#### Assessment Creation and Management

1. **New Assessment**: Navigate to assessments and create a new session
2. **Subject Information**: Enter participant details and assessment context
3. **Assessment Selection**: Choose from configured assessment types
4. **Real-time Progress**: Monitor completion status and domain scoring

#### Assessment Flow & Features

- **Intelligent Question Logic**: Skip questions based on responses and termination rules
- **Domain-Based Scoring**: Individual domain scores with clinical thresholds
- **Real-time Visualization**: Line charts showing assessment progress (completed assessments only)
- **Early Termination**: Smart skip logic based on gatekeeper questions
- **Multi-Part Assessments**: Complex assessments with prerequisite validation

#### Understanding Assessment Results

- **Domain Scores**: Raw scores vs. clinical thresholds for each domain
- **Risk Level Classification**:
  - LOW: Below clinical threshold, minimal concern
  - MODERATE: At threshold, requires attention and monitoring
  - HIGH: Above threshold, significant clinical concern
  - VERY_HIGH: Critical level requiring immediate intervention
- **AI-Generated Recommendations**: GPT-4o-mini powered clinical insights
- **Visual Analytics**: Line chart visualization of results across domains

### 📊 Professional Reporting

#### PDF Report Generation

1. **Access Reports**: Navigate to completed assessment
2. **Configure Options**: Select report components:
   - Visual charts and graphs (line charts)
   - AI-generated clinical recommendations
   - Detailed question responses
   - Trend analysis (if available)
   - Custom organization branding
3. **Generate PDF**: Professional reports with charts and clinical insights
4. **Download/Email**: Direct download or email delivery to recipients

#### Email Report Features

1. **Email Configuration**: Set up Resend email service
2. **Report Delivery**: Send assessment reports with optional PDF attachments
3. **Professional Templates**: Branded HTML email templates
4. **Automatic Notifications**: License expiration alerts and system notifications

### 🏢 Enterprise Features

#### Licensing Management

- **License Types**: Trial (basic features), Professional (full features), Enterprise (unlimited)
- **Feature Access Control**: PDF reports, AI recommendations, bulk operations based on license
- **Usage Tracking**: Monitor assessments, reports, and API usage per user
- **Organization Management**: Multi-user licenses with centralized administration

#### Administrative Dashboard

1. **User Management**: Create users, assign roles (USER/ADMIN), manage licenses
2. **Assessment Oversight**: Monitor all assessment sessions and completion rates
3. **System Analytics**: Track usage patterns, popular assessments, performance metrics
4. **Email Management**: Configure email settings, run notification campaigns
5. **License Administration**: Create, assign, and monitor license usage

#### Custom Assessment Configuration

1. **Assessment Upload**: Upload JSON-formatted assessment definitions
2. **Domain Configuration**: Set up question sets with scoring rules
3. **Clinical Thresholds**: Configure significance levels for each domain
4. **Skip Logic**: Define conditional question flow and termination rules

## Test Accounts

After seeding, you can use these test accounts:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Database Schema

### Core Models

#### User Management & Authentication

- **Users**: Authentication, role management (USER/ADMIN), organization relationships
- **Organizations**: Multi-tenant organization management with billing information
- **Licenses**: Feature-based licensing (TRIAL, BASIC, PROFESSIONAL, ENTERPRISE)
- **UserLicense**: License assignment tracking and activation status
- **Subscriptions**: Stripe integration for subscription billing and management
- **UsageMetrics**: Track daily usage (assessments, PDF reports, API calls) per user

#### Assessment System

- **Assessments**: Session management with status tracking (IN_PROGRESS, COMPLETED, ABANDONED)
- **QuestionSets**: Modular assessment domains with configurable scoring and termination rules
- **Questions**: Individual questions with weighting, ordering, and gating logic
- **TerminationRules**: Early termination logic based on response patterns
- **QuestionResponses**: User answers with timestamp tracking
- **Scores**: Domain-specific scoring with risk levels and clinical significance
- **ChatMessages**: Conversation history for assessment interactions

#### Document & Knowledge Management (Legacy)

- **Documents**: File metadata with category classification and content storage
- **DocumentChunks**: Text segments with 1536-dimensional vector embeddings for semantic search
- **ChatSessions**: Knowledge chat session management with conversation history

### Assessment Framework Architecture

#### Domain-Based Assessment Structure

- **Modular Domains**: Independent assessment areas (Antisocial, Violence, Attention, Emotional, Conduct)
- **Multi-Part Logic**: Support for complex assessments with prerequisites and conditional flow
- **Clinical Thresholds**: Evidence-based cutoff scores with configurable significance levels
- **Skip Logic**: Intelligent question flow with early termination based on gatekeeper responses

#### Scoring & Analytics

- **Real-time Calculation**: Live domain scoring with clinical threshold detection
- **Risk Classification**: Automatic risk level assignment (LOW, MODERATE, HIGH, VERY_HIGH)
- **Confidence Metrics**: AI confidence scoring for assessment reliability
- **Historical Tracking**: Assessment progress and completion pattern analysis

### Licensing & Enterprise Features

#### Feature-Based Access Control

- **Assessment Limits**: Configurable assessment quotas per license type
- **PDF Report Limits**: Monthly report generation restrictions
- **Advanced Features**: AI recommendations, bulk upload, custom branding by license tier
- **API Access**: Programmatic access control based on license permissions

#### Usage Tracking & Billing Integration

- **Daily Metrics**: Track assessments, PDF generation, and API usage
- **License Monitoring**: Automatic expiration tracking with notification workflows
- **Subscription Management**: Stripe integration for billing and payment processing
- **Organization Billing**: Multi-user license pooling and usage aggregation

## API Endpoints

### Authentication & User Management

- `POST /api/auth/register` - User registration with automatic license assignment
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers (login/logout)
- `GET /api/auth/session` - Current session and user information
- `GET /api/user/license` - Get current user's license information and feature access

### Assessment System

- `POST /api/assessments` - Create new assessment session with subject information
- `POST /api/assessments/[id]/chat` - Process assessment responses and get next questions
- `GET /api/assessments/[id]/scores` - Retrieve real-time domain scores and risk levels
- `GET /api/assessments/[id]/messages` - Get assessment conversation history
- `POST /api/assessments/[id]/report` - Generate PDF report for completed assessment
- `GET /api/assessments/[id]/report` - Download generated PDF report
- `GET /api/assessments/recommendations` - Get AI-powered recommendations based on scores

### Email & Reporting Services

- `POST /api/emails/assessment-report` - Send assessment report via email with optional PDF
- `POST /api/admin/email-jobs/run` - Manually trigger email notification jobs (admin only)

### Administrative APIs (ADMIN role required)

#### User & License Management

- `GET /api/admin/users` - List all users with roles, licenses, and activity
- `PATCH /api/admin/users/[id]/role` - Update user role (USER/ADMIN)
- `GET /api/admin/licenses` - List all licenses with usage statistics
- `POST /api/admin/licenses` - Create new license with specified features
- `POST /api/admin/licenses/[licenseId]/assign` - Assign license to user

#### Assessment Administration

- `GET /api/admin/assessments/[id]` - Get detailed assessment information
- `DELETE /api/admin/assessments/[id]` - Delete assessment and related data
- `GET /api/admin/assessments/[id]/export` - Export assessment data as JSON/CSV

#### System Analytics & Monitoring

- `GET /api/admin/stats` - Comprehensive system statistics and usage metrics
- `GET /api/admin/analytics` - Advanced analytics data for dashboard visualization

#### Document Management (Legacy)

- `POST /api/documents/upload` - Upload and process documents for knowledge base
- `GET /api/admin/documents` - List all documents with metadata and usage stats
- `PUT /api/admin/documents/[id]` - Update document metadata and categories
- `DELETE /api/admin/documents/[id]` - Remove document and associated embeddings

#### Knowledge Chat System (Legacy)

- `POST /api/knowledge/chat` - Send message to knowledge base with semantic search
- `POST /api/knowledge/sessions` - Create new knowledge chat session
- `GET /api/knowledge/sessions/[id]/messages` - Retrieve session conversation history
- `GET /api/knowledge/suggestions` - Get AI-suggested questions based on documents

## File Support & Processing

### Supported Document Formats (Legacy Knowledge Base)

- **PDF**: Text extraction using pdf-parse library
- **DOCX**: Microsoft Word documents via mammoth converter
- **Excel**: .xlsx and .xls files via xlsx library with sheet processing
- **CSV**: Comma-separated values via papaparse with encoding detection
- **TXT**: Plain text files with UTF-8 encoding support

### Assessment Configuration Files

- **JSON Assessment Definitions**: Structured assessment uploads with validation
- **Domain Specifications**: Question sets, scoring rules, and termination logic
- **Clinical Configuration**: Threshold settings and risk level mappings

### Document Processing Pipeline (Legacy)

1. **File Validation**: MIME type checking and size restrictions
2. **Text Extraction**: Format-specific content extraction with error handling
3. **Intelligent Chunking**: ~1500 character segments with 200-character overlap
4. **Vector Embedding**: OpenAI text-embedding-3-small generation (1536 dimensions)
5. **Storage**: PostgreSQL with pgvector for efficient similarity search

## Assessment AI System

### Clinical Domain Analysis

The AI system evaluates behavioral domains using evidence-based assessment frameworks:

- **Antisocial Behavior**: Social functioning, relationship patterns, rule compliance
- **Violence Risk**: Aggressive ideation, behavioral history, risk factors
- **Attention Disorders**: Focus, hyperactivity, impulsivity patterns
- **Emotional Regulation**: Mood stability, anxiety, depression indicators
- **Conduct Issues**: Authority conflicts, rule-breaking behavior

### AI-Powered Recommendations

- **Clinical Insights**: GPT-4o-mini analysis of assessment patterns and risk factors
- **Actionable Recommendations**: Evidence-based intervention suggestions
- **Risk Prioritization**: Automatic identification of highest-concern domains
- **Treatment Planning**: Structured recommendations for clinical follow-up
- **Resource Suggestions**: Relevant therapeutic resources and referrals

### Scoring & Risk Assessment

- **Adaptive Thresholds**: Configurable clinical significance levels per domain
- **Risk Classification**: Four-tier system (LOW, MODERATE, HIGH, VERY_HIGH)
- **Confidence Metrics**: AI confidence scoring for assessment reliability (0.0-1.0)
- **Pattern Recognition**: Detection of response patterns indicating clinical concern
- **Multi-Domain Analysis**: Cross-domain correlations and interaction effects

## Licensing & Feature Management

### License Tiers & Features

#### Trial License

- **Duration**: Limited trial period with basic features
- **Assessments**: 5 assessment limit
- **Reports**: No PDF generation
- **Features**: Basic assessment completion only

#### Basic License

- **Assessments**: 50 assessments per month
- **Reports**: 10 PDF reports per month
- **Features**: Standard assessments, basic recommendations

#### Professional License

- **Assessments**: 200 assessments per month
- **Reports**: 50 PDF reports per month
- **Features**: AI recommendations, advanced charts, email reports, bulk operations

#### Enterprise License

- **Assessments**: Unlimited
- **Reports**: Unlimited PDF generation
- **Features**: All features, custom branding, API access, priority support, multi-user organizations

### License Management Features

- **Automatic Assignment**: New users receive appropriate license based on organization
- **Usage Tracking**: Real-time monitoring of feature usage against license limits
- **Expiration Management**: Automated notifications and grace period handling
- **Feature Gating**: Runtime feature access control based on active license
- **Upgrade Workflows**: Seamless license tier transitions with feature unlocking

## Development Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server

# Database Management
npm run db:generate  # Generate Prisma client (alias for npx prisma generate)
npm run db:migrate   # Run database migrations (alias for npx prisma migrate dev)
npm run db:seed      # Seed database with sample data (alias for npx prisma db seed)
npm run db:studio    # Open Prisma Studio database GUI (alias for npx prisma studio)

# Direct Prisma Commands
npx prisma studio    # Database GUI for data exploration
npx prisma migrate dev --name <migration-name>  # Create new migration
npx prisma db push   # Push schema changes without migration
npx prisma db reset  # Reset database and apply all migrations
npx prisma generate  # Regenerate Prisma client after schema changes

# Code Quality & Type Checking
npm run lint         # ESLint checking with Next.js configuration
npm run type-check   # TypeScript type checking across all files
```

## Production Deployment

### Environment Setup

1. **Environment Variables**: Configure all required environment variables in production
2. **Database Setup**: PostgreSQL 14+ with pgvector extension enabled
3. **Email Service**: Resend API key configuration for email functionality
4. **OpenAI Integration**: Valid OpenAI API key with sufficient quota
5. **Security**: Strong NEXTAUTH_SECRET and secure database credentials

### Performance Optimization

- **Database Indexing**: Ensure proper indexes on frequently queried fields (assessments, scores, users)
- **Connection Pooling**: Configure PostgreSQL connection pooling for high concurrency
- **CDN Integration**: Static asset optimization and caching
- **Memory Management**: Monitor Node.js memory usage for large-scale deployments
- **Rate Limiting**: Implement API rate limiting to prevent abuse

### Security Considerations

- **Environment Security**: Never commit sensitive environment variables
- **HTTPS**: Always use HTTPS in production with valid SSL certificates
- **Database Security**: Use encrypted connections and least-privilege access
- **Input Validation**: Comprehensive validation on all API endpoints
- **Authentication**: Secure session management with appropriate timeout settings
- **File Upload**: Strict file type validation and size limits
- **CORS Configuration**: Appropriate Cross-Origin Resource Sharing policies

### Monitoring & Maintenance

- **Error Tracking**: Implement error logging and monitoring (e.g., Sentry)
- **Performance Monitoring**: Track API response times and database query performance
- **Usage Analytics**: Monitor license usage and feature adoption
- **Backup Strategy**: Regular database backups with tested restoration procedures
- **Update Management**: Regular dependency updates and security patches

## Troubleshooting

### Common Issues & Solutions

#### Database Connection Problems

**PostgreSQL Connection Issues:**

- Verify PostgreSQL service is running: `brew services start postgresql@15` (macOS) or `systemctl status postgresql` (Linux)
- Check DATABASE_URL format: `postgresql://username:password@host:port/database?schema=public`
- Ensure database exists and pgvector extension is installed
- Test connection: `psql -d ai_diagnostic -c "\dx"` to verify pgvector is installed

**Prisma-Related Errors:**

- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` for development schema changes
- Reset database if corrupted: `npx prisma db reset` (WARNING: This deletes all data)

#### OpenAI API Issues

**Authentication Errors:**

- Verify OPENAI_API_KEY is set correctly in `.env.local`
- Check API key permissions and quota at platform.openai.com
- Ensure API key has access to GPT-4o-mini and text-embedding-3-small models

**Rate Limiting:**

- Monitor API usage and implement request queuing for high-volume usage
- Consider implementing caching for repeated assessment patterns
- Check OpenAI billing status and usage limits

#### Email Service Issues

**Resend Configuration:**

- Verify RESEND_API_KEY is valid and active
- Check RESEND_FROM_EMAIL domain verification status
- Test email delivery with simple test messages first
- Monitor Resend dashboard for delivery failures and bounces

**Email Delivery Problems:**

- Check recipient email addresses for typos
- Verify domain reputation and SPF/DKIM records
- Monitor email logs for delivery failures
- Ensure PDF attachments don't exceed size limits

#### File Upload & Processing

**File Upload Failures:**

- Check MAX_FILE_SIZE setting in environment variables
- Verify UPLOAD_DIR exists and has proper write permissions
- Ensure supported file types: PDF, DOCX, Excel, CSV, TXT
- Monitor disk space for file storage

**PDF Generation Issues:**

- Verify jsPDF dependencies are installed correctly
- Check canvas support for chart generation
- Monitor memory usage for large reports
- Ensure all assessment data is available before generation

#### Assessment System Problems

**Assessment Loading Issues:**

- Verify assessment configuration JSON is valid
- Check domain definitions and question sequences
- Ensure clinical thresholds are properly configured
- Validate termination rules and skip logic

**Scoring Calculation Errors:**

- Check domain configuration for proper scoring rules
- Verify question weights and total possible scores
- Ensure responses are being saved correctly
- Validate risk level threshold calculations

#### Licensing & Permission Issues

**License Assignment Problems:**

- Verify user has active license assigned
- Check license expiration dates
- Ensure license features match required permissions
- Validate organization membership for multi-user licenses

**Feature Access Denied:**

- Check user's license tier and feature permissions
- Verify license hasn't expired or been suspended
- Ensure usage limits haven't been exceeded
- Validate user role permissions (USER vs ADMIN)

#### Performance Issues

**Slow API Responses:**

- Check database query performance with `EXPLAIN ANALYZE`
- Monitor OpenAI API response times
- Verify database indexes are properly configured
- Consider implementing caching for frequently accessed data

**Memory Usage:**

- Monitor Node.js memory consumption during PDF generation
- Check for memory leaks in long-running processes
- Optimize large file processing and chunking
- Consider implementing request queuing for high-volume scenarios

### Getting Help & Support

1. **Check Console Logs**: Browser developer tools and server logs often provide detailed error information
2. **Verify Environment**: Ensure all required environment variables are set correctly
3. **Database Connectivity**: Test database connection and verify all services are running
4. **API Key Validation**: Confirm all external service API keys are valid and have sufficient quotas
5. **Documentation Review**: Check the relevant sections above for configuration details

### Debug Mode & Logging

- Enable detailed logging by setting `NODE_ENV=development`
- Check Next.js console output for detailed error messages
- Monitor Prisma query logs for database-related issues
- Use browser developer tools for client-side debugging

## Architecture & Design Patterns

The application follows clean architecture principles with clear separation of concerns:

### Layer Architecture

- **Presentation Layer**: React components using shadcn/ui with TypeScript
- **API Layer**: Next.js API routes with validation and error handling
- **Business Logic Layer**: Service classes for AI, licensing, email, and assessment logic
- **Data Layer**: Prisma ORM with PostgreSQL and domain models
- **External Services**: OpenAI, Resend email, and third-party integrations

### Key Design Patterns

- **Domain-Driven Design**: Assessment domains as first-class entities with bounded contexts
- **Service Layer Pattern**: Dedicated service classes for complex business logic
- **Repository Pattern**: Prisma as data access abstraction layer
- **Strategy Pattern**: Multiple license types with feature-specific implementations
- **Observer Pattern**: Real-time assessment scoring and progress updates
- **Factory Pattern**: PDF generation with configurable report options

### Component Organization

```
components/
├── admin/          # Administrative interfaces
├── assessment/     # Assessment-specific components
├── charts/         # Visualization components (Recharts)
├── reports/        # PDF and email reporting
├── ui/             # Reusable UI primitives (shadcn/ui)
└── analytics/      # Dashboard and analytics components
```

### API Design Philosophy

- **RESTful Conventions**: Standard HTTP methods and resource-based URLs
- **Role-Based Security**: Consistent authentication and authorization patterns
- **Error Handling**: Standardized error responses with appropriate HTTP status codes
- **Input Validation**: Comprehensive validation using Zod schemas
- **Feature Gating**: License-based feature access control at API level

This architecture ensures maintainability, testability, and scalability for enterprise production use.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests if applicable (follow existing test patterns)
5. Ensure code passes linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Submit a pull request with detailed description

### Development Guidelines

- **TypeScript**: Maintain strict type safety throughout the codebase
- **Code Style**: Follow ESLint configuration and Prettier formatting
- **Component Design**: Use shadcn/ui patterns for consistent UI components
- **API Design**: Follow existing RESTful conventions and error handling patterns
- **Database Changes**: Always create migrations for schema changes
- **Testing**: Add tests for new business logic and API endpoints

## Project Roadmap & Future Enhancements

### Completed Features ✅

- Enterprise licensing system with multi-tier feature access
- Professional PDF report generation with visual charts
- Email automation system with Resend integration
- Real-time assessment visualization using Recharts
- Custom assessment upload and configuration system
- Multi-tenant organization management
- Advanced analytics dashboard for administrators

### Planned Enhancements 🚧

- **Conversational Assessment Mode**: Child-friendly conversational interface
- **Advanced Analytics**: Machine learning insights for assessment patterns
- **Webhook Integration**: Real-time notifications for external systems
- **Mobile App**: React Native companion app for field assessments
- **API Gateway**: Enhanced API management with rate limiting and monitoring
- **Audit Logging**: Comprehensive audit trails for compliance requirements

### Integration Opportunities 🔮

- **Stripe Billing**: Advanced subscription management and billing automation
- **FHIR Compliance**: Healthcare data interoperability standards
- **Single Sign-On**: Enterprise SSO integration (SAML, OAuth2)
- **Telehealth Platforms**: Integration with video conferencing and EHR systems
- **Research Platforms**: Data export for clinical research and studies
