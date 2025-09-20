# AI Diagnostic Assessment & Knowledge Chat Platform

A Next.js 15 application that provides structured behavioral assessments with the Early Detection Screener and intelligent document-based knowledge chat. Designed for clinical and research use with comprehensive scoring, risk evaluation, and AI-powered recommendations.

## Features

### 🧠 Early Detection Screener Assessment

- **Structured Assessment**: Evidence-based Early Detection Screener with 3 clinical domains
- **Smart Question Flow**: Gatekeeper questions with skip logic for efficient assessment
- **Multi-Part Scoring**: Complex scoring algorithms with clinical thresholds
- **Real-time Progress**: Visual progress tracking and domain completion status
- **AI Recommendations**: GPT-4 powered clinical insights based on assessment results

### 📊 Assessment Domains

- **Suicidality**: 7 questions, clinical threshold ≥3, includes skip logic for efficiency
- **Self-Harm**: 7 questions, clinical threshold ≥3, comprehensive risk evaluation
- **Antisocial Personality**: 12 questions with Part 1/Part 2 structure, age prerequisite validation

### 💬 Knowledge Chat System

- **Document Q&A**: Intelligent chat with uploaded knowledge base
- **Semantic Search**: Vector-based document search using OpenAI embeddings + pgvector
- **Source Citations**: Responses include specific document references and page numbers
- **Multi-format Support**: PDF, DOCX, Excel, CSV, TXT file processing

### 📄 Document Management

- **Smart Processing**: Intelligent chunking with overlap for better context retention
- **Vector Storage**: 1536-dimensional embeddings for semantic similarity
- **Category System**: Organized document classification (Policy, Procedure, Manual, etc.)
- **Bulk Operations**: Efficient upload and management of document collections

### 📈 Comprehensive Scoring & Analytics

- **Risk Level Assessment**: LOW, MODERATE, HIGH, VERY_HIGH classifications
- **Clinical Significance**: Domain-specific thresholds for clinical interpretation
- **Visual Charts**: Real-time scoring visualization with Recharts
- **Historical Tracking**: Assessment progress and completion tracking
- **Export Capabilities**: Assessment results and recommendations export

### 👑 Administrative Features

- **Assessment Management**: Create, monitor, and analyze assessment sessions
- **User Administration**: Role-based access control and user management
- **Document Library**: Centralized knowledge base management with categorization
- **System Analytics**: Usage statistics, performance monitoring, and storage management
- **Data Export**: Comprehensive reporting and data export capabilities

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL + pgvector extension
- **ORM**: Prisma with full TypeScript support
- **Authentication**: NextAuth.js v5 with credentials provider
- **AI**: OpenAI GPT-4 + text-embedding-3-small
- **UI**: Tailwind CSS + shadcn/ui components
- **File Processing**: pdf-parse, mammoth, xlsx, papaparse

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
2. **Choose Mode**: Select Assessment or Knowledge Chat from the main dashboard
3. **Start Session**: Begin assessment or upload documents for knowledge chat

### 📋 Conducting Assessments

#### Creating a New Assessment

1. **Navigate to Assessments** from the main menu
2. **Click "New Assessment"** and enter subject information
3. **Assessment begins automatically** with the first question

#### Assessment Flow

- **Structured Questions**: Answer yes/no questions from 3 clinical domains
- **Progress Tracking**: Visual progress bar shows completion status
- **Skip Logic**: Efficient question flow based on responses
  - Example: "No" to suicidality gatekeeper skips to final domain question
- **Real-time Scoring**: See domain scores update as you progress
- **Visual Charts**: Live scoring charts show risk levels and clinical significance

#### Understanding Results

- **Domain Scores**: Each domain shows raw score vs. clinical threshold
- **Risk Levels**:
  - LOW: Below clinical threshold
  - MODERATE: At threshold, requires attention
  - HIGH: Above threshold, clinical concern
  - VERY_HIGH: Significant clinical concern
- **AI Recommendations**: GPT-4 generated insights based on assessment patterns
- **Completion Status**: Track which domains are complete vs. skipped

#### Assessment Domains Explained

**Suicidality (7 questions)**

- Clinical threshold: ≥3 positive responses
- Includes gatekeeper questions for efficiency
- Skip logic: Negative gatekeeper responses jump to final question

**Self-Harm (7 questions)**

- Clinical threshold: ≥3 positive responses
- Comprehensive self-injury behavior assessment
- Progressive questioning from ideation to behavior

**Antisocial Personality (12 questions)**

- Prerequisites: Age ≥15 years required
- Part 1 (5 questions): Early conduct problems, threshold ≥3
- Part 2 (7 questions): Adult antisocial behavior, threshold ≥3
- Clinical significance requires both parts to meet thresholds

### 💬 Knowledge Chat

#### Setting Up Knowledge Base

1. **Upload Documents**: Navigate to Admin → Documents (admin) or use document upload
2. **Supported Formats**: PDF, DOCX, Excel, CSV, TXT files
3. **Categorization**: Organize by Policy, Procedure, Manual, Assessment Tool, etc.
4. **Processing**: Documents are automatically chunked and embedded for search

#### Using Knowledge Chat

1. **Start Chat Session**: Click "Knowledge Chat" from main menu
2. **Ask Questions**: Type questions about your uploaded documents
3. **Source Citations**: Responses include specific document references
4. **Follow-up**: Continue conversation with context maintained
5. **Session Management**: Chat history is saved and searchable

### 🎛️ Admin Features

#### User Management

- **View All Users**: Monitor user accounts and activity
- **Role Management**: Assign USER or ADMIN roles
- **Assessment Monitoring**: Track user assessment progress
- **Data Export**: Export user data and assessment results

#### Document Library Management

- **Bulk Upload**: Upload multiple documents simultaneously
- **Category Organization**: Organize documents by type and purpose
- **Content Search**: Find documents by content, not just filename
- **Usage Analytics**: Track which documents are most queried
- **Document Editing**: Update categories and metadata

#### System Analytics

- **Assessment Statistics**: Track completion rates and domain patterns
- **Usage Metrics**: Monitor chat sessions and document queries
- **Storage Monitoring**: Track file storage and database usage
- **Performance Metrics**: Monitor response times and system health

## Test Accounts

After seeding, you can use these test accounts:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Database Schema

### Core Models

- **Users**: Authentication and role management (USER/ADMIN)
- **Assessments**: Early Detection Screener assessment sessions with domain tracking
- **QuestionResponses**: Individual question answers with timestamps
- **Scores**: Domain-specific scoring with risk levels and clinical significance
- **ChatMessages**: Conversation history for assessment and knowledge chat
- **Documents**: Knowledge base file metadata and content storage
- **DocumentChunks**: Text segments with 1536-dimensional vector embeddings
- **ChatSessions**: Knowledge chat session management with conversation history

### Assessment System

- **Early Detection Screener**: 3-domain structured assessment
- **Skip Logic**: Gatekeeper questions with conditional flow
- **Multi-part Scoring**: Complex scoring for Antisocial Personality domain
- **Clinical Thresholds**: Evidence-based cutoff scores for each domain
- **Real-time Progress**: Live tracking of domain completion and scoring

### Vector Search System

- **Semantic Search**: OpenAI text-embedding-3-small (1536 dimensions)
- **Chunking Strategy**: ~1500 characters with 200-character overlap
- **pgvector Integration**: Efficient similarity search in PostgreSQL
- **Source Attribution**: Document references with chunk-level citations

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration with role assignment
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers
- `GET /api/auth/session` - Current session information

### Assessment System

- `POST /api/assessments` - Create new Early Detection Screener assessment
- `POST /api/assessments/[id]/chat` - Process assessment question responses
- `GET /api/assessments/[id]/scores` - Get real-time domain scores and risk levels
- `GET /api/assessments/[id]/messages` - Retrieve assessment conversation history

### Knowledge Chat System

- `POST /api/knowledge/chat` - Send message to knowledge base
- `POST /api/knowledge/sessions` - Create new knowledge chat session
- `GET /api/knowledge/sessions/[id]/messages` - Get session message history
- `GET /api/knowledge/suggestions` - Get suggested questions based on documents

### Document Management

- `POST /api/documents/upload` - Upload and process documents (PDF, DOCX, Excel, CSV, TXT)
- Document processing includes chunking, embedding generation, and vector storage

### Administrative APIs (ADMIN role required)

- `GET /api/admin/documents` - List all documents with metadata
- `PUT /api/admin/documents/[id]` - Update document category and metadata
- `DELETE /api/admin/documents/[id]` - Delete document and associated embeddings
- `GET /api/admin/users` - List all users with role and activity information
- `PUT /api/admin/users/[id]/role` - Update user role (USER/ADMIN)
- `GET /api/admin/stats` - System statistics and analytics dashboard
- `PATCH /api/admin/users/[id]/role` - Update user role
- `GET /api/admin/stats` - System statistics

## File Support

### Supported Formats

- **PDF**: Extracted using pdf-parse
- **DOCX**: Microsoft Word documents via mammoth
- **Excel**: .xlsx and .xls files via xlsx library
- **CSV**: Comma-separated values via papaparse
- **TXT**: Plain text files

### Processing Pipeline

1. File validation and type checking
2. Text extraction using format-specific processors
3. Intelligent chunking with overlap (1500 chars default)
4. Vector embedding generation via OpenAI
5. Storage in PostgreSQL with pgvector for similarity search

## Assessment AI

### Behavioral Domains

- **Antisocial**: Social withdrawal, isolation, relationship difficulties
- **Violence**: Aggressive thoughts, violent tendencies, harm potential
- **Attention**: Focus issues, hyperactivity, impulsivity
- **Emotional**: Mood regulation, anxiety, depression indicators
- **Conduct**: Rule-breaking, defiance, authority conflicts

### Scoring System

- **Range**: 0-100 per domain
- **Risk Levels**: Automatic classification based on scores
- **Confidence**: AI confidence in assessment (0.0-1.0)
- **Real-time**: Updates with each conversation exchange

## Knowledge AI

### Vector Search

- **Semantic Similarity**: Cosine similarity using pgvector
- **Relevance Threshold**: Configurable similarity thresholds
- **Source Attribution**: Automatic citation of document sources
- **Context Window**: Intelligent context assembly from top matches

### RAG (Retrieval Augmented Generation)

- **Query Processing**: Understanding user intent and context
- **Document Retrieval**: Top-k relevant document chunks
- **Context Assembly**: Intelligent context construction
- **Response Generation**: GPT-4 with retrieved context
- **Source Citing**: Transparent source attribution

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Use strong, unique NEXTAUTH_SECRET
3. Configure production database with SSL
4. Set up proper CORS and CSP headers
5. Enable rate limiting for API endpoints

### Performance Considerations

- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Vector Search**: Monitor pgvector performance and adjust parameters
- **File Storage**: Consider cloud storage for uploaded files in production
- **Caching**: Implement Redis for session storage and API caching
- **Monitoring**: Set up logging and error tracking

### Security Best Practices

- **Environment Variables**: Never commit sensitive data
- **File Validation**: Comprehensive file type and size validation
- **Rate Limiting**: Prevent abuse of AI endpoints
- **HTTPS**: Always use HTTPS in production
- **Database Security**: Use connection pooling and proper credentials
- **CORS**: Configure appropriate CORS policies

## Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Database GUI
npx prisma migrate   # Run migrations
npx prisma db seed   # Seed database
npx prisma generate  # Generate Prisma client

# Code Quality
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking
```

## Troubleshooting

### Common Issues

**Database Connection Issues:**

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure pgvector extension is installed

**OpenAI API Issues:**

- Verify OPENAI_API_KEY is set correctly
- Check API quota and billing
- Monitor rate limits

**File Upload Issues:**

- Check MAX_FILE_SIZE setting
- Verify file permissions
- Ensure UPLOAD_DIR exists

**Performance Issues:**

- Monitor pgvector query performance
- Check database indexes
- Consider connection pooling

### Getting Help

1. Check the troubleshooting section above
2. Review the console for error messages
3. Verify environment variables are set correctly
4. Check database connectivity and pgvector installation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Architecture

The application follows a clean architecture pattern with:

- **Presentation Layer**: React components with shadcn/ui
- **API Layer**: Next.js API routes with proper validation
- **Business Logic**: AI service classes for assessment and knowledge
- **Data Layer**: Prisma ORM with PostgreSQL and pgvector
- **External Services**: OpenAI for embeddings and chat completion

This architecture ensures maintainability, testability, and scalability for production use.
