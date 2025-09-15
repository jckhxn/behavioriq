# AI Assessment & Document Knowledge Chat App

A Next.js 15 application that combines conversational AI behavioral assessments with intelligent document-based chat. Users can conduct psychological assessments while also chatting with their knowledge base of uploaded documents.

## Features

### 🧠 Dual Chat Interface
- **Assessment Mode**: AI behavioral evaluation with real-time scoring
- **Knowledge Mode**: Document Q&A with semantic search and source citations

### 📄 Document Processing
- **Multi-format Support**: PDF, DOCX, Excel, CSV, TXT
- **Vector Search**: Semantic document search using OpenAI embeddings + PostgreSQL pgvector
- **Smart Chunking**: Intelligent text segmentation with overlap for better context

### 📊 Real-time Assessment Scoring
- **5 Assessment Domains**: Antisocial, Violence, Attention, Emotional, Conduct
- **Live Scoring**: Real-time behavioral analysis with confidence scores
- **Risk Levels**: LOW, MODERATE, HIGH, VERY_HIGH with visual indicators

### 👑 Admin Dashboard
- **Document Management**: Bulk upload, categorization, and organization
- **User Management**: Role-based access control and user administration
- **System Analytics**: Usage statistics, storage monitoring, and performance metrics

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

## Test Accounts

After seeding, you can use these test accounts:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Database Schema

### Core Models

- **Users**: Authentication and role management (USER/ADMIN)
- **Documents**: File metadata and content storage
- **DocumentChunks**: Text segments with vector embeddings
- **Assessments**: Behavioral assessment sessions
- **ChatMessages**: Conversation history for both modes
- **Scores**: Real-time assessment domain scores
- **ChatSessions**: Knowledge chat session management

### Key Features

- **Vector Embeddings**: 1536-dimension OpenAI embeddings for semantic search
- **Role-based Access**: Admin and user permissions
- **Comprehensive Indexing**: Optimized for performance and search
- **Cascade Deletes**: Proper cleanup of related data

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Assessments
- `POST /api/assessments` - Create new assessment
- `POST /api/assessments/[id]/chat` - Assessment conversation
- `GET /api/assessments/[id]/scores` - Real-time scores
- `GET /api/assessments/[id]/messages` - Message history

### Knowledge Chat
- `POST /api/knowledge/chat` - Knowledge conversation
- `POST /api/knowledge/sessions` - Create chat session
- `GET /api/knowledge/suggestions` - Suggested questions
- `GET /api/knowledge/sessions/[id]/messages` - Message history

### Document Management
- `POST /api/documents/upload` - File upload and processing

### Admin (ADMIN role required)
- `GET /api/admin/documents` - All documents
- `DELETE /api/admin/documents/[id]` - Delete document
- `GET /api/admin/users` - User management
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
