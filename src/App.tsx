import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { Sidebar } from './components/Sidebar/Sidebar';
import { RichTextEditor } from './components/Editor/RichTextEditor';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { AIService } from './utils/ai';
import { 
  Save, 
  Lock, 
  Unlock, 
  Sparkles, 
  Languages, 
  History, 
  Share2,
  Menu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function App() {
  const {
    notes,
    pinnedNotes,
    regularNotes,
    loading: notesLoading,
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
    refreshAIFeatures,
    exportNotes,
    importNotes
  } = useNotes();

  const { settings, loading: settingsLoading, toggleTheme } = useSettings();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [encryptPassword, setEncryptPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translateLanguage, setTranslateLanguage] = useState('Spanish');
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslatedContent, setLastTranslatedContent] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string>('');
  const [showAITools, setShowAITools] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState<null | 'summarize' | 'translate' | 'grammar' | 'glossary'>(null);
  const [grammarSuggestions, setGrammarSuggestions] = useState<any[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number | null>(null);
  const [lastSavedTitle, setLastSavedTitle] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [aiCooldownUntil, setAiCooldownUntil] = useState<number | null>(null);
  const [translateCooldownUntil, setTranslateCooldownUntil] = useState<number | null>(null);
  // Removed unused cooldown tick interval

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Simulate loading progress for welcome screen
  useEffect(() => {
    if (showWelcomeScreen) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [showWelcomeScreen]);

  // Handle share link: if URL has #share/{id}, open that note
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#share\/(.+)$/);
    if (!match) return;
    const id = match[1];
    const note = notes.find(n => n.id === id);
    if (note && !note.isEncrypted) {
      setSelectedNoteId(id);
      setNoteTitle(note.title);
      setEditorContent(note.content);
    }
  }, [notes]);

  // Hide welcome screen after loading completes
  useEffect(() => {
    if (loadingProgress >= 100) {
      const timer = setTimeout(() => {
        setShowWelcomeScreen(false);
      }, 2000); // Give users 2 seconds to see the completed welcome screen
      return () => clearTimeout(timer);
    }
  }, [loadingProgress]);

  // Auto-save functionality (debounced + change detection)
  useEffect(() => {
    if (!selectedNoteId) return;
    if (isTranslating || isEncrypting) return;

    const currentTitle = noteTitle || 'Untitled';
    const hasChanges = currentTitle !== (lastSavedTitle || 'Untitled') || editorContent !== lastSavedContent;
    if (!hasChanges) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateNote(selectedNoteId, {
          title: currentTitle,
          content: editorContent
        });
        setLastSavedTitle(currentTitle);
        setLastSavedContent(editorContent);
      } catch (error) {
        console.error('Failed to save note:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [selectedNoteId, editorContent, noteTitle, updateNote, isTranslating, isEncrypting, lastSavedTitle, lastSavedContent]);

  // Keyboard shortcuts
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setIsCommandPaletteOpen(true);
  });

  useHotkeys('mod+n', (e) => {
    e.preventDefault();
    handleCreateNote();
  });

  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    if (selectedNoteId) {
      updateNote(selectedNoteId, {
        title: noteTitle || 'Untitled',
        content: editorContent
      });
    }
  });

  const handleCreateNote = async () => {
    try {
      const newNoteId = await createNote('New Note', '');
      setSelectedNoteId(newNoteId);
      setNoteTitle('New Note');
      setEditorContent('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleWelcomeScreenStart = () => {
    setShowWelcomeScreen(false);
  };

  const handleShowWelcomeScreen = () => {
    setShowWelcomeScreen(true);
    setLoadingProgress(0);
  };

  const handleEditNote = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    if (note.isEncrypted && !note.content) {
      // Note is encrypted and needs to be decrypted
      return;
    }

    setSelectedNoteId(noteId);
    setNoteTitle(note.title);
    setEditorContent(note.content);
    setLastSavedTitle(note.title);
    setLastSavedContent(note.content);
  };

  const handleDecryptNote = async (noteId: string, password: string) => {
    try {
      const decryptedContent = await decryptNote(noteId, password);
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setSelectedNoteId(noteId);
        setNoteTitle(note.title);
        setEditorContent(decryptedContent);
        
        // Temporarily update the note with decrypted content for editing
        await updateNote(noteId, { 
          content: decryptedContent,
          isEncrypted: false,
          encryptedData: undefined 
        });
      }
    } catch (error) {
      console.warn('Decryption failed - invalid password provided');
    }
  };

  const handleEncryptNote = async () => {
    if (!selectedNoteId || !encryptPassword) return;

    setIsEncrypting(true);
    try {
      await encryptNote(selectedNoteId, encryptPassword);
      setShowEncryptModal(false);
      setEncryptPassword('');
      // Clear editor after encryption
      setEditorContent('');
      setSelectedNoteId(null);
    } catch (error) {
      console.error('Failed to encrypt note:', error);
    } finally {
      setIsEncrypting(false);
    }
  };

  const currentNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
  const currentTitle = noteTitle || 'Untitled';
  const hasUnsavedChanges = !!selectedNoteId && (currentTitle !== (lastSavedTitle || 'Untitled') || editorContent !== lastSavedContent);

  // Show welcome screen if enabled
  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        onStart={handleWelcomeScreenStart}
        isLoading={loadingProgress < 100}
        loadingProgress={loadingProgress}
      />
    );
  }

  if (notesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden"
    >
      {/* Sidebar */}
      <Sidebar
        notes={notes}
        pinnedNotes={pinnedNotes}
        regularNotes={regularNotes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        onCreateNote={handleCreateNote}
        onEditNote={handleEditNote}
        onDeleteNote={deleteNote}
        onTogglePin={togglePin}
        onDecryptNote={handleDecryptNote}
        selectedNoteId={selectedNoteId ?? undefined}
        isDark={settings.theme === 'dark'}
        onToggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onShowWelcome={handleShowWelcomeScreen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[50vh] md:min-h-0">
        {selectedNoteId && currentNote ? (
          <>
            {/* Editor Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-none outline-none flex-1 placeholder-gray-400"
                  placeholder="Untitled Note"
                />
                
                <div className="min-w-[140px] flex items-center justify-end">
                  {isSaving ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <Save size={16} className="animate-pulse" />
                      Saving...
                    </motion.div>
                  ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle size={16} />
                      Unsaved changes
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 size={16} />
                      Saved
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEncryptModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  title="Encrypt Note"
                >
                  {currentNote.isEncrypted ? <Unlock size={16} /> : <Lock size={16} />}
                  {currentNote.isEncrypted ? 'Encrypted' : 'Encrypt'}
                </button>

                <button onClick={() => {
                  const cooling = aiCooldownUntil ? Date.now() < aiCooldownUntil : false;
                  if (cooling) {
                    setToast({ type: 'info', message: 'AI Tools cooling down. Please wait.' });
                    setTimeout(() => setToast(null), 2000);
                    return;
                  }
                  setShowAITools(true);
                }} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                  <Sparkles size={16} />
                  {aiCooldownUntil && Date.now() < aiCooldownUntil ? `AI Tools (${Math.max(0, Math.ceil((aiCooldownUntil - Date.now())/1000))}s)` : 'AI Tools'}
                </button>

                <button onClick={() => {
                  const cooling = translateCooldownUntil ? Date.now() < translateCooldownUntil : false;
                  if (cooling) {
                    setToast({ type: 'info', message: 'Translate cooling down. Please wait.' });
                    setTimeout(() => setToast(null), 2000);
                    return;
                  }
                  setShowTranslateModal(true);
                }} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                  <Languages size={16} />
                  {translateCooldownUntil && Date.now() < translateCooldownUntil ? `Translate (${Math.max(0, Math.ceil((translateCooldownUntil - Date.now())/1000))}s)` : 'Translate'}
                </button>

                {lastTranslatedContent && (
                  <button
                    onClick={() => {
                      if (lastTranslatedContent) {
                        setEditorContent(lastTranslatedContent);
                        setLastTranslatedContent(null);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Undo last translation"
                  >
                    <History size={16} />
                    Undo Translate
                  </button>
                )}

                <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <History size={16} />
                  History
                </button>

                <button
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  onClick={() => {
                    if (!currentNote) return;
                    const container = document.createElement('div');
                    container.innerHTML = editorContent || '';
                    const plain = container.textContent || '';
                    const titleSafe = (noteTitle || 'note').replace(/[^a-z0-9\-\_ ]/gi, '').trim().replace(/\s+/g, '-').toLowerCase();
                    const filename = `${titleSafe || 'note'}.txt`;
                    try {
                      const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                      setToast({ type: 'success', message: 'Exported as .txt' });
                    } catch {
                      setToast({ type: 'error', message: 'Export failed' });
                    } finally {
                      setTimeout(() => setToast(null), 2000);
                    }
                  }}
                >
                  <Share2 size={16} />
                  Export
                </button>

                

                <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await importNotes(file);
                      setToast({ type: 'success', message: `Imported ${res.imported}, skipped ${res.skipped}` });
                    } catch (err) {
                      setToast({ type: 'error', message: 'Import failed' });
                    } finally {
                      setTimeout(() => setToast(null), 2500);
                      e.currentTarget.value = '';
                    }
                  }} />
                  Import
                </label>
              </div>
            </motion.div>

            {/* Editor */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <RichTextEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="Start writing your note..."
                className="h-full"
              />
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="text-center max-w-md">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center"
              >
                <Sparkles size={32} className="text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to Next-Gen Notes
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Experience the future of note-taking with AI-powered features, 
                encryption, and beautiful design. Create your first note or 
                select one from the sidebar to get started.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateNote}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Create Your First Note
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Menu size={20} />
                  Open Command Palette
                </motion.button>
              </div>
              
              {/* Keyboard shortcuts hint removed as requested */}
            </div>
          </motion.div>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateNote={handleCreateNote}
        onToggleTheme={toggleTheme}
        isDark={settings.theme === 'dark'}
      />

      {/* Encrypt Modal */}
      <AnimatePresence>
        {showEncryptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEncryptModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-amber-500" size={24} />
                <h3 className="text-lg font-semibold">Encrypt Note</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Set a password to encrypt this note. The content will be secured with AES-256 encryption.
              </p>
              
              <input
                type="password"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
                onKeyPress={(e) => e.key === 'Enter' && handleEncryptNote()}
                autoFocus
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEncryptModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isEncrypting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEncryptNote}
                  disabled={!encryptPassword.trim() || isEncrypting}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isEncrypting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Encrypt
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version History Modal */}
      <AnimatePresence>
        {showHistoryModal && currentNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-3">Version History</h3>
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {[...currentNote.versions].reverse().map((v, i) => {
                    const idx = currentNote.versions.length - 1 - i;
                    const isSelected = selectedVersionIndex === idx;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVersionIndex(idx)}
                        className={`w-full text-left p-3 rounded-lg border ${isSelected ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        <div className="text-sm font-medium">v{v.version}</div>
                        <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                {selectedVersionIndex === null ? (
                  <div className="h-[60vh] flex items-center justify-center text-gray-500">Select a version to preview</div>
                ) : (
                  <div className="flex flex-col h-[60vh]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Preview (v{currentNote.versions[selectedVersionIndex].version})</div>
                      <div className="text-xs text-gray-500">{new Date(currentNote.versions[selectedVersionIndex].createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: currentNote.versions[selectedVersionIndex].content }} />
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={async () => {
                          if (!selectedNoteId) return;
                          const selected = currentNote.versions[selectedVersionIndex!];
                          setEditorContent(selected.content);
                          setNoteTitle(currentNote.title || 'Untitled');
                          await updateNote(selectedNoteId, { content: selected.content, title: currentTitle });
                          setShowHistoryModal(false);
                          setToast({ type: 'success', message: `Restored v${selected.version}` });
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Restore this version
                      </button>
                      <button
                        onClick={() => setShowHistoryModal(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tools Action Sheet */}
      <AnimatePresence>
        {showAITools && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAITools(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-indigo-500" size={22} />
                  <h3 className="text-lg font-semibold">AI Tools</h3>
                </div>
                <button onClick={() => setShowAITools(false)} className="px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    if (!selectedNoteId) return;
                    setAiActionLoading('summarize');
                    const status = await refreshAIFeatures(selectedNoteId);
                    setAiActionLoading(null);
                    if (status === 'success') setToast({ type: 'success', message: 'Summary and tags updated' });
                    else if (status === 'throttled') setToast({ type: 'info', message: 'Please wait before trying again' });
                    else setToast({ type: 'error', message: 'AI service unavailable' });
                    const cooldownMs = status === 'throttled' ? 15_000 : 30_000;
                    setAiCooldownUntil(Date.now() + cooldownMs);
                    setTimeout(() => setToast(null), 2500);
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  disabled={aiActionLoading !== null}
                >
                  <div className="font-medium">Summarize + Generate Tags</div>
                  <div className="text-sm text-gray-500">Create a short summary and smart tags</div>
                </button>

                <button
                  onClick={() => {
                    setShowAITools(false);
                    setShowTranslateModal(true);
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  disabled={aiActionLoading !== null}
                >
                  <div className="font-medium">Translate</div>
                  <div className="text-sm text-gray-500">Translate the note to another language</div>
                </button>

                <button
                  onClick={async () => {
                    setAiActionLoading('grammar');
                    try {
                      const res = await AIService.checkGrammar(editorContent || '');
                      setGrammarSuggestions(res);
                      setToast({ type: 'success', message: `Grammar suggestions: ${res.length}` });
                    } catch {
                      setToast({ type: 'error', message: 'Grammar check failed' });
                    } finally {
                      setAiActionLoading(null);
                      setTimeout(() => setToast(null), 2500);
                    }
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  disabled={aiActionLoading !== null}
                >
                  <div className="font-medium">Grammar Check</div>
                  <div className="text-sm text-gray-500">Highlight possible typos and fixes</div>
                </button>

                <button
                  onClick={async () => {
                    setAiActionLoading('glossary');
                    try {
                      const res = await AIService.getGlossaryTerms(editorContent || '');
                      setGlossaryTerms(res);
                      setToast({ type: 'success', message: `Found terms: ${res.length}` });
                    } catch {
                      setToast({ type: 'error', message: 'Glossary failed' });
                    } finally {
                      setAiActionLoading(null);
                      setTimeout(() => setToast(null), 2500);
                    }
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  disabled={aiActionLoading !== null}
                >
                  <div className="font-medium">Glossary</div>
                  <div className="text-sm text-gray-500">Extract and define key terms</div>
                </button>
              </div>

              {(grammarSuggestions.length > 0 || glossaryTerms.length > 0) && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grammarSuggestions.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Grammar Suggestions</div>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {grammarSuggestions.map((g, i) => (
                          <div key={i} className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                            Replace "{g.text}" with "{g.suggestion}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {glossaryTerms.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Glossary</div>
                      <div className="space-y-2 max-h-40 overflow-auto">
                        {glossaryTerms.map((t, i) => (
                          <div key={i} className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                            <span className="font-medium">{t.term}:</span> {t.definition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'info'
                ? 'bg-indigo-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Translate Modal */}
      <AnimatePresence>
        {showTranslateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setTranslateError('');
              setShowTranslateModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Languages className="text-green-500" size={24} />
                <h3 className="text-lg font-semibold">Translate Note</h3>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose a language to translate the current note. This will replace the editor content.
              </p>

              <select
                value={translateLanguage}
                onChange={(e) => setTranslateLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
              >
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Italian</option>
                <option>Portuguese</option>
                <option>Hindi</option>
                <option>Arabic</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Korean</option>
              </select>

              {translateError && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-400">{translateError}</div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setTranslateError('');
                    setShowTranslateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isTranslating}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!editorContent.trim()) return;
                    setIsTranslating(true);
                    try {
                      const original = editorContent;
                      const translated = await AIService.translateText(original, translateLanguage);
                      if (!translated || translated === original) {
                        setTranslateError('Translation unavailable right now. Please try again in a moment.');
                      } else {
                        setEditorContent(translated);
                        setLastTranslatedContent(original);
                        setTranslateError('');
                        setShowTranslateModal(false);
                      }
                    } catch (e) {
                      setTranslateError('Translation failed. Please try again later.');
                    } finally {
                      setIsTranslating(false);
                      setTranslateCooldownUntil(Date.now() + 30_000);
                    }
                  }}
                  disabled={isTranslating || !editorContent.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages size={16} />
                      Translate
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;