import { useState, useEffect } from 'react';
import { Note } from '../types';
import { db } from '../utils/database';
import { EncryptionUtil } from '../utils/encryption';
import { AIService } from '../utils/ai';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lastAIFeatureUpdateAt, setLastAIFeatureUpdateAt] = useState<number>(0);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string): Promise<string> => {
    const now = new Date();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      isEncrypted: false,
      tags: [],
      version: 1,
      versions: []
    };

    // Generate AI features
    try {
      const [summary, tags] = await Promise.all([
        AIService.generateSummary(content),
        AIService.generateTags(content)
      ]);
      
      newNote.aiSummary = summary;
      newNote.tags = tags;
    } catch (error) {
      console.warn('AI features unavailable:', error);
    }

    await db.notes.add(newNote);
    await loadNotes();
    return newNote.id;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const note = await db.notes.get(id);
    if (!note) return;

    // Create version history
    if (updates.content && updates.content !== note.content) {
      const version = {
        id: crypto.randomUUID(),
        content: note.content,
        createdAt: note.updatedAt,
        version: note.version
      };
      
      const updatedVersions = [...note.versions, version];
      updates.versions = updatedVersions;
      updates.version = note.version + 1;
    }

    updates.updatedAt = new Date();

    // Disable automatic AI generation on every save to avoid rate limits

    await db.notes.update(id, updates);
    await loadNotes();
  };

  // Manual AI refresh triggered by user; includes simple throttle
  type RefreshStatus = 'success' | 'throttled' | 'error' | 'empty';

  const refreshAIFeatures = async (id: string, contentOverride?: string): Promise<RefreshStatus> => {
    const note = await db.notes.get(id);
    if (!note) return 'error';
    const now = Date.now();
    const THROTTLE_WINDOW_MS = 30_000;
    if (now - lastAIFeatureUpdateAt < THROTTLE_WINDOW_MS) return 'throttled';

    try {
      const sourceContent = (contentOverride ?? note.content ?? '').trim();
      if (!sourceContent) return 'empty';
      const [summary, tags] = await Promise.all([
        AIService.generateSummary(sourceContent),
        AIService.generateTags(sourceContent)
      ]);
      await db.notes.update(id, { aiSummary: summary, tags });
      setLastAIFeatureUpdateAt(now);
      await loadNotes();
      return 'success';
    } catch (error) {
      console.warn('AI refresh failed:', error);
      return 'error';
    }
  };

  const importNotes = async (file: File): Promise<{ imported: number; skipped: number }> => {
    const text = await file.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid file format');
    }
    const items: Note[] = Array.isArray(data?.notes) ? data.notes : Array.isArray(data) ? data : [];
    if (!Array.isArray(items)) throw new Error('Invalid notes data');

    let imported = 0;
    let skipped = 0;
    for (const n of items) {
      if (!n.id) { skipped++; continue; }
      const existing = await db.notes.get(n.id);
      if (existing) {
        // Keep the latest by updatedAt
        const incomingNewer = new Date(n.updatedAt) > new Date(existing.updatedAt);
        if (incomingNewer) {
          await db.notes.put({ ...existing, ...n });
          imported++;
        } else {
          skipped++;
        }
      } else {
        await db.notes.add({ ...n, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) });
        imported++;
      }
    }
    await loadNotes();
    return { imported, skipped };
  };

  const deleteNote = async (id: string) => {
    await db.notes.delete(id);
    await loadNotes();
  };

  const togglePin = async (id: string) => {
    const note = await db.notes.get(id);
    if (note) {
      await updateNote(id, { isPinned: !note.isPinned });
    }
  };

  const encryptNote = async (id: string, password: string) => {
    const note = await db.notes.get(id);
    if (!note) return;

    try {
      const encryptedData = await EncryptionUtil.encrypt(note.content, password);
      await updateNote(id, {
        isEncrypted: true,
        encryptedData,
        content: '' // Clear plain text content
      });
    } catch (error) {
      throw new Error('Failed to encrypt note');
    }
  };

  const decryptNote = async (id: string, password: string): Promise<string> => {
    const note = await db.notes.get(id);
    if (!note || !note.isEncrypted || !note.encryptedData) {
      throw new Error('Note is not encrypted');
    }

    try {
      return await EncryptionUtil.decrypt(note.encryptedData, password);
    } catch (error) {
      throw new Error('Invalid password');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return {
    notes: filteredNotes,
    pinnedNotes,
    regularNotes,
    loading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    encryptNote,
    decryptNote,
    loadNotes,
    refreshAIFeatures,
    importNotes
  };
};