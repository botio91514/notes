export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isEncrypted: boolean;
  encryptedData?: string;
  tags: string[];
  aiSummary?: string;
  version: number;
  versions: NoteVersion[];
}

export interface NoteVersion {
  id: string;
  content: string;
  createdAt: Date;
  version: number;
}

export interface AIFeatures {
  summary: string;
  tags: string[];
  glossary: GlossaryTerm[];
  grammarSuggestions: GrammarSuggestion[];
  insights: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  position: { start: number; end: number };
}

export interface GrammarSuggestion {
  text: string;
  suggestion: string;
  position: { start: number; end: number };
  type: 'grammar' | 'spelling' | 'style';
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  fontFamily: string;
  aiEnabled: boolean;
  encryptionEnabled: boolean;
}

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}