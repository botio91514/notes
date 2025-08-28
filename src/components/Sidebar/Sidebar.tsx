import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Settings,
  Moon,
  Sun,
  Sparkles,
  Shield,
  Menu,
  X,
  Pin,
  FileText,
  Home
} from 'lucide-react';
import { NoteCard } from '../Notes/NoteCard';
import { Note } from '../../types';

interface SidebarProps {
  notes: Note[];
  pinnedNotes: Note[];
  regularNotes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onCreateNote: () => void;
  onEditNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDecryptNote: (id: string, password: string) => void;
  selectedNoteId?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onShowWelcome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  pinnedNotes,
  regularNotes,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onDecryptNote,
  selectedNoteId,
  isDark,
  onToggleTheme,
  isCollapsed = false,
  onToggleCollapse,
  onShowWelcome
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all unique tags from notes
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 360 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full md:w-auto md:h-screen bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between mb-4'}`}>
          <motion.h1 
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            {!isCollapsed && 'Notes'}
          </motion.h1>
          
          <div className={`${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2'}`}>
            {onShowWelcome && (
              <button
                onClick={onShowWelcome}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Welcome Screen"
              >
                <Home size={20} />
              </button>
            )}
            
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <Menu size={20} /> : <X size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        )}

        {/* Create Note Button */}
        {!isCollapsed && (
          <button
            onClick={onCreateNote}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus size={18} />
            New Note
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Pinned ({pinnedNotes.length})
                </h3>
              </div>
              <div className="space-y-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                    onTogglePin={onTogglePin}
                    onDecrypt={onDecryptNote}
                    isSelected={selectedNoteId === note.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Notes ({regularNotes.length})
                </h3>
              </div>
              <div className="space-y-3">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                    onTogglePin={onTogglePin}
                    onDecrypt={onDecryptNote}
                    isSelected={selectedNoteId === note.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Create your first note to get started</p>
            </div>
          )}

          {/* No Search Results */}
          {notes.length > 0 && searchQuery && regularNotes.length === 0 && pinnedNotes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notes found</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Tag Filters */}
      {!isCollapsed && allTags.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-500" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Tags</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings size={14} />
            </button>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};