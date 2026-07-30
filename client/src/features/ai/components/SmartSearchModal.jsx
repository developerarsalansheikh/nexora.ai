import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useSmartSearch } from '../api/useAi';
import { FiSearch, FiZap, FiX, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * SmartSearchModal — AI-powered natural language task search.
 * e.g. "Find all high priority bugs due this week assigned to Alex"
 */
export default function SmartSearchModal({ isOpen, onClose, onSelectTask }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const searchMutation = useSmartSearch(organizationId, workspaceId);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || searchMutation.isPending) return;
    const res = await searchMutation.mutateAsync(query.trim());
    if (res) setResults(res);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-start justify-center pt-20 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-primary rounded-2xl border border-border-primary shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 h-16 border-b border-border-primary bg-bg-secondary/50">
          <FiZap size={18} className="text-brand-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI e.g. 'Find high priority bugs due this week'..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none font-medium"
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-text-tertiary hover:text-text-primary p-1">
              <FiX size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim() || searchMutation.isPending}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <FiSearch size={13} />
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {searchMutation.isPending && (
            <div className="flex items-center justify-center py-12 text-text-tertiary gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span>AI is interpreting your query and matching tasks...</span>
            </div>
          )}

          {results && !searchMutation.isPending && (
            <div className="space-y-4">
              {/* AI Interpretation Banner */}
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-medium flex items-center justify-between">
                <span>💡 {results.interpretation}</span>
                <span className="text-[10px] opacity-75">{results.tasks?.length || 0} tasks found</span>
              </div>

              {/* Task Items List */}
              {results.tasks?.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  No tasks matched your search query. Try rephrasing.
                </div>
              ) : (
                <div className="space-y-2">
                  {results.tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => {
                        if (onSelectTask) onSelectTask(task);
                        onClose();
                      }}
                      className="w-full text-left p-3.5 rounded-xl border border-border-primary hover:border-brand-500/30 hover:bg-bg-tertiary transition-all duration-150 flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-text-primary text-xs group-hover:text-brand-500 transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                          <span className="uppercase font-bold">{task.type}</span>
                          <span>·</span>
                          <span className="capitalize">Priority: {task.priority}</span>
                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
