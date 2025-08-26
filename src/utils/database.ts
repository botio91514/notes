import Dexie, { Table } from 'dexie';
import { Note, NoteVersion, AppSettings } from '../types';

export class NotesDatabase extends Dexie {
  notes!: Table<Note>;
  versions!: Table<NoteVersion>;
  settings!: Table<AppSettings>;

  constructor() {
    super('NotesDatabase');
    
    this.version(1).stores({
      notes: '++id, title, content, createdAt, updatedAt, isPinned, isEncrypted, tags',
      versions: '++id, noteId, content, createdAt, version',
      settings: '++id, theme, fontSize, fontFamily, aiEnabled, encryptionEnabled'
    });
  }
}

export const db = new NotesDatabase();

// Initialize default settings
db.on('ready', async () => {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      theme: 'light',
      fontSize: 16,
      fontFamily: 'Inter',
      aiEnabled: true,
      encryptionEnabled: true
    } as AppSettings);
  }
});