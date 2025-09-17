# Configuration System Overview

This document provides an overview of the centralized configuration system for the AI Assessment & Knowledge Chat application.

## Table of Contents

- [Configuration Structure](#configuration-structure)
- [Key Configuration Files](#key-configuration-files)
- [Configuration Categories](#configuration-categories)
- [Usage Examples](#usage-examples)
- [Customization Guide](#customization-guide)
- [Best Practices](#best-practices)

## Configuration Structure

All configuration is centralized in `/lib/config/ai-config.ts` to:
- **Eliminate hardcoded values** throughout the codebase
- **Enable easy customization** without code changes
- **Provide type safety** for configuration values
- **Centralize system behavior** in one location

## Key Configuration Files

### 1. Main Configuration (`/lib/config/ai-config.ts`)
Contains all AI models, parameters, prompts, and system settings.

### 2. Documentation Guides
- `/docs/ASSESSMENT_GUIDE.md` - Guide for customizing assessments
- `/docs/DOCUMENT_GUIDE.md` - Guide for managing documents and knowledge chat
- `/docs/CONFIG_SYSTEM.md` - This overview document

## Configuration Categories

### AI Models
```typescript
export const AI_MODELS = {
  CHAT: {
    PRIMARY: 'gpt-4',           // Main model for conversations
    FALLBACK: 'gpt-3.5-turbo', // Backup model
    FAST: 'gpt-3.5-turbo',     // Quick operations
  },
  EMBEDDING: {
    PRIMARY: 'text-embedding-3-small',  // Document embeddings
    LARGE: 'text-embedding-3-large',    // High-quality embeddings
  }
}
```

### AI Parameters
```typescript
export const AI_PARAMETERS = {
  ASSESSMENT: {
    TEMPERATURE: 0.3,                    // Response consistency
    MAX_TOKENS: 800,                     // Response length
    MAX_CONVERSATION_LENGTH: 20,         // Max assessment exchanges
    MIN_EXCHANGES_FOR_COMPLETION: 8,     // Minimum before completion
    MAX_EXCHANGES_FOR_COMPLETION: 12,    // Target completion range
    SCORE_CONFIDENCE_THRESHOLD: 0.5,     // Minimum confidence
  },
  KNOWLEDGE: {
    TEMPERATURE: 0.3,                    // Response consistency
    MAX_TOKENS: 1000,                    // Response length
    CONTEXT_WINDOW: 20,                  // Messages in history
    CONVERSATION_CONTEXT_LIMIT: 6,       // Context for AI
    SEARCH_LIMIT: 5,                     // Max search results
    SEARCH_THRESHOLD: 0.6,               // Minimum similarity
    HIGH_SIMILARITY_THRESHOLD: 0.7,      // High confidence threshold
    MIN_SIMILARITY_FOR_CONTEXT: 0.6,     // Include in context
    CONFIDENCE_BOOST_FACTOR: 1.2,        // Confidence calculation
    MAX_CONFIDENCE: 0.95,                // Maximum confidence
  }
}
```

### Assessment Configuration
```typescript
export const ASSESSMENT_CONFIG = {
  DOMAINS: {
    [AssessmentDomain.ANTISOCIAL]: {
      name: 'Antisocial Behavior',
      description: 'Social withdrawal, isolation, lack of social skills',
      keywords: ['isolation', 'withdrawn', 'antisocial', 'alone'],
    },
    // ... other domains
  },
  RISK_THRESHOLDS: {
    [RiskLevel.LOW]: { min: 0, max: 25 },
    [RiskLevel.MODERATE]: { min: 26, max: 50 },
    [RiskLevel.HIGH]: { min: 51, max: 75 },
    [RiskLevel.VERY_HIGH]: { min: 76, max: 100 },
  }
}
```

### Knowledge Chat Configuration
```typescript
export const KNOWLEDGE_CONFIG = {
  CATEGORIES: {
    [DocumentCategory.POLICY]: {
      name: 'Policy',
      emoji: '📋',
      description: 'Organizational policies and rules',
    },
    // ... other categories
  },
  DEFAULT_SUGGESTIONS: [
    "What are the key policies I should be aware of?",
    "Can you summarize the main procedures?",
    // ... more suggestions
  ]
}
```

### System Prompts
```typescript
export const SYSTEM_PROMPTS = {
  ASSESSMENT_ANALYSIS: `You are a psychological assessment AI...`,
  ASSESSMENT_QUESTIONS: `You are conducting a psychological assessment...`,
  KNOWLEDGE_RESPONSE: `You are a knowledgeable AI assistant...`,
  FALLBACKS: {
    ASSESSMENT_QUESTION: "Can you tell me more about how you've been feeling lately?",
    KNOWLEDGE_NO_CONTEXT: "I don't have enough relevant information...",
    KNOWLEDGE_ERROR: "I encountered an error while processing...",
  }
}
```

## Usage Examples

### In Assessment AI
```typescript
import { AI_MODELS, AI_PARAMETERS, SYSTEM_PROMPTS } from '@/lib/config/ai-config'

// Use configured model and parameters
const completion = await generateChatCompletion(messages, {
  model: AI_MODELS.CHAT.PRIMARY,
  temperature: AI_PARAMETERS.ASSESSMENT.TEMPERATURE,
  maxTokens: AI_PARAMETERS.ASSESSMENT.MAX_TOKENS
})

// Use configured system prompt
const systemPrompt = SYSTEM_PROMPTS.ASSESSMENT_ANALYSIS
```

### In Knowledge AI
```typescript
import { AI_PARAMETERS, KNOWLEDGE_CONFIG } from '@/lib/config/ai-config'

// Use configured search parameters
const searchResults = await searchSimilarDocuments(query, userId, {
  limit: AI_PARAMETERS.KNOWLEDGE.SEARCH_LIMIT,
  threshold: AI_PARAMETERS.KNOWLEDGE.SEARCH_THRESHOLD
})

// Use configured suggestions
const suggestions = getCategorySuggestions(categories)
```

### In UI Components
```typescript
import { getCategoryInfo } from '@/lib/config/ai-config'

// Get category display information
const categoryInfo = getCategoryInfo(DocumentCategory.POLICY)
// Returns: { name: 'Policy', emoji: '📋', description: '...' }
```

## Customization Guide

### 1. Changing AI Models
```typescript
export const AI_MODELS = {
  CHAT: {
    PRIMARY: 'gpt-4-turbo',      // Change to newer model
    FALLBACK: 'gpt-3.5-turbo',
    FAST: 'gpt-3.5-turbo',
  }
}
```

### 2. Adjusting Assessment Behavior
```typescript
export const AI_PARAMETERS = {
  ASSESSMENT: {
    TEMPERATURE: 0.2,            // Lower = more consistent
    MAX_CONVERSATION_LENGTH: 15, // Shorter assessments
    MIN_EXCHANGES_FOR_COMPLETION: 6,  // Complete sooner
  }
}
```

### 3. Modifying Risk Thresholds
```typescript
export const ASSESSMENT_CONFIG = {
  RISK_THRESHOLDS: {
    [RiskLevel.LOW]: { min: 0, max: 30 },      // Expand low risk
    [RiskLevel.MODERATE]: { min: 31, max: 60 }, // Adjust thresholds
    [RiskLevel.HIGH]: { min: 61, max: 80 },
    [RiskLevel.VERY_HIGH]: { min: 81, max: 100 },
  }
}
```

### 4. Customizing System Prompts
```typescript
export const SYSTEM_PROMPTS = {
  ASSESSMENT_ANALYSIS: `You are a specialized psychological assessment AI...

  [Your custom instructions here]

  Respond ONLY with valid JSON...`,
}
```

### 5. Adding New Document Categories
```typescript
// 1. Update the enum in Prisma schema
// 2. Add to configuration
export const KNOWLEDGE_CONFIG = {
  CATEGORIES: {
    [DocumentCategory.YOUR_NEW_CATEGORY]: {
      name: 'Your Category',
      emoji: '🆕',
      description: 'Description of your category',
    }
  }
}
```

## Best Practices

### 1. Environment-Specific Configuration
```typescript
// For different environments
const getTemperature = () => {
  if (process.env.NODE_ENV === 'development') return 0.7  // More creative
  if (process.env.NODE_ENV === 'testing') return 0.1     // More predictable
  return 0.3  // Production default
}
```

### 2. Configuration Validation
```typescript
// Add validation functions
export function validateAssessmentConfig() {
  // Ensure all domains have valid thresholds
  // Verify required prompts exist
  // Check model availability
}
```

### 3. Configuration Versioning
- Tag configuration changes in version control
- Keep documentation updated with changes
- Test configuration changes thoroughly
- Maintain backward compatibility when possible

### 4. Testing Configuration Changes
```typescript
// Test different configurations
describe('Assessment Configuration', () => {
  it('should complete assessment within configured range', () => {
    const minExchanges = AI_PARAMETERS.ASSESSMENT.MIN_EXCHANGES_FOR_COMPLETION
    const maxExchanges = AI_PARAMETERS.ASSESSMENT.MAX_EXCHANGES_FOR_COMPLETION
    // Test assessment behavior
  })
})
```

### 5. Performance Monitoring
```typescript
// Monitor the impact of configuration changes
const startTime = Date.now()
const result = await processWithConfig()
const duration = Date.now() - startTime

// Log performance metrics
console.log(`Operation completed in ${duration}ms with config version ${CONFIG_VERSION}`)
```

## Migration Guide

### From Hardcoded Values
1. **Identify hardcoded values** in your code
2. **Add to configuration** in appropriate section
3. **Import configuration** in affected files
4. **Replace hardcoded values** with config references
5. **Test functionality** to ensure no regression
6. **Update documentation** with new configuration options

### Example Migration
```typescript
// Before (hardcoded)
const completion = await generateChatCompletion(messages, {
  model: 'gpt-4',
  temperature: 0.3,
  maxTokens: 800
})

// After (configurable)
import { AI_MODELS, AI_PARAMETERS } from '@/lib/config/ai-config'

const completion = await generateChatCompletion(messages, {
  model: AI_MODELS.CHAT.PRIMARY,
  temperature: AI_PARAMETERS.ASSESSMENT.TEMPERATURE,
  maxTokens: AI_PARAMETERS.ASSESSMENT.MAX_TOKENS
})
```

## Troubleshooting

### Common Issues
1. **Import errors**: Ensure correct import paths
2. **Type errors**: Use proper TypeScript types
3. **Configuration not applied**: Check if using old hardcoded values
4. **Performance changes**: Monitor impact of parameter changes

### Debugging Configuration
```typescript
// Add debugging to see what configuration is being used
console.log('Using AI model:', AI_MODELS.CHAT.PRIMARY)
console.log('Assessment parameters:', AI_PARAMETERS.ASSESSMENT)
```

### Configuration Validation
```typescript
// Validate configuration on startup
if (!AI_MODELS.CHAT.PRIMARY) {
  throw new Error('Primary chat model not configured')
}

if (AI_PARAMETERS.ASSESSMENT.TEMPERATURE > 1) {
  console.warn('High temperature may cause inconsistent responses')
}
```

This centralized configuration system makes the application much more maintainable and customizable while ensuring type safety and consistency across the codebase.