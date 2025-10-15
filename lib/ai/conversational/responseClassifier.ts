import { AnswerExtraction, TokenUsage } from "./types";

const STRONG_POSITIVE = [
  "yes",
  "yeah",
  "yep",
  "yup",
  "sure",
  "of course",
  "definitely",
  "absolutely",
  "always",
  "all the time",
  "for sure",
  "uh huh",
];

const STRONG_NEGATIVE = [
  "no",
  "nope",
  "nah",
  "never",
  "not at all",
  "absolutely not",
  "definitely not",
  "no way",
  "hardly ever",
];

const SOFT_POSITIVE = [
  "sometimes",
  "often",
  "pretty often",
  "usually",
  "most of the time",
  "kind of",
  "sort of",
  "a bit",
  "a little",
];

const SOFT_NEGATIVE = [
  "not often",
  "not usually",
  "rarely",
  "barely",
  "infrequently",
  "not much",
  "not really much",
];

const AMBIGUOUS = [
  "maybe",
  "not sure",
  "unsure",
  "i don't know",
  "idk",
  "depends",
  "it depends",
  "sometimes yes sometimes no",
  "hard to say",
];

const POSITIVE_HINTS = [
  "problem",
  "struggle",
  "issue",
  "concern",
  "worry",
  "trouble",
  "difficult",
  "difficulty",
];

const NEGATIVE_HINTS = ["fine", "good", "normal", "okay", "ok", "well", "great", "calm"];

const NON_WORD_CHARS = /[^a-z0-9\s']/gi;

export const ZERO_TOKEN_USAGE: TokenUsage = Object.freeze({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});

export function classifyBooleanResponse(raw: string): AnswerExtraction | null {
  if (!raw) {
    return null;
  }

  const normalized = raw
    .toLowerCase()
    .replace(NON_WORD_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return null;
  }

  if (matchesAny(normalized, AMBIGUOUS)) {
    return null;
  }

  if (matchesAny(normalized, STRONG_POSITIVE)) {
    return { answer: true, confidence: 0.95, tokenUsage: ZERO_TOKEN_USAGE };
  }

  if (matchesAny(normalized, STRONG_NEGATIVE)) {
    return { answer: false, confidence: 0.95, tokenUsage: ZERO_TOKEN_USAGE };
  }

  if (matchesAny(normalized, SOFT_POSITIVE)) {
    return { answer: true, confidence: 0.75, tokenUsage: ZERO_TOKEN_USAGE };
  }

  if (matchesAny(normalized, SOFT_NEGATIVE)) {
    return { answer: false, confidence: 0.75, tokenUsage: ZERO_TOKEN_USAGE };
  }

  const positiveScore = countMatches(normalized, POSITIVE_HINTS);
  const negativeScore = countMatches(normalized, NEGATIVE_HINTS);
  const scoreDelta = positiveScore - negativeScore;

  if (positiveScore > 0 || negativeScore > 0) {
    if (scoreDelta >= 2) {
      return { answer: true, confidence: 0.65, tokenUsage: ZERO_TOKEN_USAGE };
    }
    if (scoreDelta <= -2) {
      return { answer: false, confidence: 0.65, tokenUsage: ZERO_TOKEN_USAGE };
    }
  }

  return null;
}

function matchesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => includesPhrase(text, phrase));
}

function countMatches(text: string, phrases: string[]): number {
  return phrases.reduce((count, phrase) => count + (includesPhrase(text, phrase) ? 1 : 0), 0);
}

function includesPhrase(text: string, phrase: string): boolean {
  if (phrase.includes(" ")) {
    return text.includes(phrase);
  }
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}
