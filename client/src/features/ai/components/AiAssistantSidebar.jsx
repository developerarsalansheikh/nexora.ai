import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useAiChat, useConversations, useConversation } from '../api/useAi';
import {
  FiSend,
  FiX,
  FiMessageSquare,
  FiPlus,
  FiCopy,
  FiRefreshCw,
  FiClock,
  FiChevronLeft,
  FiZap,
} from 'react-icons/fi';

/**
 * AiAssistantSidebar — Premium slide-out AI chat panel.
 * Features: conversation threads, message history, markdown rendering, copy, regenerate.
 */
export default function AiAssistantSidebar({ isOpen, onClose, projectId }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [message, setMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const chatMutation = useAiChat(organizationId, workspaceId);
  const { data: conversationsData } = useConversations(organizationId, workspaceId, { projectId });
  const { data: activeConversation } = useConversation(organizationId, workspaceId, activeConversationId);

  // Load conversation messages when switching
  useEffect(() => {
    if (activeConversation?.messages) {
      setLocalMessages(activeConversation.messages);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || chatMutation.isPending) return;

    // Optimistic user message
    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setLocalMessages((prev) => [...prev, userMsg]);
    setMessage('');

    try {
      const result = await chatMutation.mutateAsync({
        message: trimmed,
        conversationId: activeConversationId,
        projectId,
      });

      const responseContent = result?.response || result?.data?.response || 'I received your request.';
      const convId = result?.conversationId || result?.data?.conversationId;

      const aiMsg = { role: 'model', content: responseContent, timestamp: new Date().toISOString() };
      setLocalMessages((prev) => [...prev, aiMsg]);

      if (!activeConversationId && convId) {
        setActiveConversationId(convId);
      }
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        { role: 'model', content: '❌ Something went wrong. Please try again.', timestamp: new Date().toISOString() },
      ]);
    }
  }, [message, activeConversationId, projectId, chatMutation]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setLocalMessages([]);
    setShowHistory(false);
  };

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...localMessages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;
    // Remove last AI message and resend
    setLocalMessages((prev) => {
      const msgs = [...prev];
      if (msgs[msgs.length - 1]?.role === 'model') msgs.pop();
      return msgs;
    });
    try {
      const result = await chatMutation.mutateAsync({
        message: lastUserMsg.content,
        conversationId: activeConversationId,
        projectId,
      });
      setLocalMessages((prev) => [
        ...prev,
        { role: 'model', content: result.response, timestamp: new Date().toISOString() },
      ]);
    } catch {
      // Handled by mutation error
    }
  };

  const conversations = conversationsData?.docs || [];

  const quickPrompts = [
    { label: '📋 Plan a sprint', prompt: 'Help me plan the next sprint for this project' },
    { label: '🐛 Write a bug report', prompt: 'Write a detailed bug report template' },
    { label: '📊 Project health', prompt: 'Give me a health check summary for this project' },
    { label: '📝 Release notes', prompt: 'Generate release notes for the latest changes' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-bg-primary border-l border-border-primary shadow-2xl z-[999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border-primary bg-bg-secondary/50 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                {showHistory && (
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                )}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <FiZap size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Nexora AI</h2>
                    <p className="text-[10px] text-text-tertiary">
                      {showHistory ? 'Conversation History' : 'Intelligent Assistant'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                  title="Chat History"
                >
                  <FiClock size={16} />
                </button>
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                  title="New Conversation"
                >
                  <FiPlus size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            {showHistory ? (
              /* Conversation History List */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
                      <FiMessageSquare size={24} className="text-text-tertiary" />
                    </div>
                    <p className="text-sm text-text-secondary font-medium">No conversations yet</p>
                    <p className="text-xs text-text-tertiary mt-1">Start a new chat to begin</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setActiveConversationId(conv._id);
                        setShowHistory(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 group ${
                        activeConversationId === conv._id
                          ? 'border-brand-500/30 bg-brand-500/5'
                          : 'border-border-primary hover:border-brand-500/20 hover:bg-bg-tertiary'
                      }`}
                    >
                      <p className="text-xs font-medium text-text-primary truncate group-hover:text-brand-500 transition-colors">
                        {conv.title}
                      </p>
                      <p className="text-[10px] text-text-tertiary mt-1">
                        {conv.messages?.length || 0} messages ·{' '}
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : (
              /* Chat Messages Area */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {localMessages.length === 0 ? (
                  /* Empty State with Quick Prompts */
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-5 shadow-lg">
                      <FiZap size={32} className="text-brand-500" />
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-1">How can I help?</h3>
                    <p className="text-xs text-text-tertiary text-center max-w-[280px] mb-6">
                      I can help you plan sprints, write descriptions, analyze risks, and generate documentation.
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[360px]">
                      {quickPrompts.map((qp) => (
                        <button
                          key={qp.label}
                          onClick={() => {
                            setMessage(qp.prompt);
                            inputRef.current?.focus();
                          }}
                          className="text-left px-3 py-2.5 rounded-xl border border-border-primary hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-200 group"
                        >
                          <span className="text-xs text-text-secondary group-hover:text-brand-500 transition-colors">
                            {qp.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Messages */
                  localMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-brand-600 text-white rounded-br-md'
                            : 'bg-bg-tertiary text-text-primary rounded-bl-md border border-border-primary'
                        }`}
                      >
                        {/* Render content with basic markdown-like formatting */}
                        <div className="whitespace-pre-wrap break-words ai-message-content">
                          {msg.content}
                        </div>

                        {/* AI message actions */}
                        {msg.role === 'model' && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-primary/30">
                            <button
                              onClick={() => handleCopy(msg.content, idx)}
                              className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-brand-500 transition-colors"
                            >
                              <FiCopy size={11} />
                              {copiedIndex === idx ? 'Copied!' : 'Copy'}
                            </button>
                            {idx === localMessages.length - 1 && (
                              <button
                                onClick={handleRegenerate}
                                disabled={chatMutation.isPending}
                                className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-brand-500 transition-colors disabled:opacity-50"
                              >
                                <FiRefreshCw size={11} />
                                Regenerate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Typing indicator */}
                {chatMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-xs text-text-tertiary"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Nexora AI is thinking...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            {!showHistory && (
              <div className="shrink-0 border-t border-border-primary p-4 bg-bg-secondary/30 backdrop-blur-md">
                <div className="flex items-end gap-2 bg-bg-tertiary rounded-xl border border-border-primary focus-within:border-brand-500/50 transition-colors p-2">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Nexora AI anything..."
                    rows={1}
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-tertiary resize-none outline-none min-h-[36px] max-h-[120px] py-2 px-2"
                    style={{ height: 'auto', overflow: 'hidden' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || chatMutation.isPending}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-bg-tertiary disabled:text-text-tertiary text-white transition-all duration-200 shadow-md shadow-brand-500/20 disabled:shadow-none"
                  >
                    <FiSend size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-text-tertiary mt-2 text-center">
                  Powered by Gemini AI · Responses may not always be accurate
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
