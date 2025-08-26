import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Pin, 
  Lock, 
  Trash2, 
  Edit, 
  Share2, 
  Clock, 
  Tag,
  Sparkles,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDecrypt?: (id: string, password: string) => void;
  isSelected?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onDecrypt,
  isSelected = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [password, setPassword] = useState('');
  const [decryptError, setDecryptError] = useState('');

  const handleDecrypt = async () => {
    if (!onDecrypt || !password.trim()) return;
    
    try {
      await onDecrypt(note.id, password);
      setShowDecryptModal(false);
      setPassword('');
      setDecryptError('');
    } catch (error) {
      setDecryptError('Invalid password');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        cardRef.current && !cardRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
        className={`
          relative group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
          p-6 cursor-pointer transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600
          ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''}
        `}
        ref={cardRef}
        onClick={() => !note.isEncrypted && onEdit(note.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {note.isEncrypted && <Lock size={16} className="text-amber-500 flex-shrink-0" />}
            {note.isPinned && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Pin size={16} className="text-indigo-500 flex-shrink-0" />
              </motion.div>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {note.isEncrypted ? '🔒 Locked Note' : note.title || 'Untitled'}
            </h3>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4 }}
                className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[200px]"
                ref={menuRef}
              >
                {note.isEncrypted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDecryptModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye size={14} />
                    Decrypt
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pin size={14} />
                  {note.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${window.location.origin}${window.location.pathname}#share/${note.id}`;
                    navigator.clipboard.writeText(url);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        {!note.isEncrypted && (
          <div className="mb-4">
            {note.aiSummary && (
              <div className="flex items-start gap-2 mb-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <Sparkles size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                  {note.aiSummary}
                </p>
              </div>
            )}
            <div 
              className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
              dangerouslySetInnerHTML={{ 
                __html: note.content || 'No content...' 
              }}
            />
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
              >
                <Tag size={10} />
                {tag}
              </motion.span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(note.updatedAt)}
          </div>
          <div className="flex items-center gap-2">
            {note.version > 1 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                v{note.version}
              </span>
            )}
          </div>
        </div>

        {/* Pin indicator animation */}
        {note.isPinned && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        )}
      </motion.div>

      {/* Decrypt Modal */}
      {showDecryptModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDecryptModal(false)}
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
              <h3 className="text-lg font-semibold">Decrypt Note</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter the password to decrypt and view this note.
            </p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleDecrypt()}
              autoFocus
            />
            
            {decryptError && (
              <p className="text-red-500 text-sm mt-2">{decryptError}</p>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDecryptModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecrypt}
                disabled={!password.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Decrypt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};