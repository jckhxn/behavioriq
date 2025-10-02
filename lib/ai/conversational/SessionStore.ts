import { ConversationalSession } from "./types";

/**
 * Shared in-memory session storage for conversational assessments
 * Uses Next.js global pattern to persist across hot reloads in development
 * In production, this should be replaced with Redis or similar
 */
class SessionStore {
  private sessions: Map<string, ConversationalSession>;

  constructor() {
    this.sessions = new Map();
  }

  set(sessionId: string, session: ConversationalSession): void {
    this.sessions.set(sessionId, session);
    console.log(
      `[SessionStore] Session ${sessionId} stored. Total sessions: ${this.sessions.size}`
    );
  }

  get(sessionId: string): ConversationalSession | undefined {
    const session = this.sessions.get(sessionId);
    console.log(
      `[SessionStore] Session ${sessionId} ${session ? "found" : "not found"}. Total sessions: ${this.sessions.size}`
    );
    return session;
  }

  delete(sessionId: string): boolean {
    const result = this.sessions.delete(sessionId);
    console.log(
      `[SessionStore] Session ${sessionId} deleted. Total sessions: ${this.sessions.size}`
    );
    return result;
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  size(): number {
    return this.sessions.size;
  }
}

// Use Next.js global pattern to prevent re-initialization during hot reloads
declare global {
  var __conversationalSessionStore: SessionStore | undefined;
}

if (!global.__conversationalSessionStore) {
  global.__conversationalSessionStore = new SessionStore();
}

export const sessionStore = global.__conversationalSessionStore;
