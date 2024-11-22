import 'express-session';

declare module 'express-session' {
  interface SessionData {
    conversation: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
  }
}