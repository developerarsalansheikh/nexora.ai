import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useProjectHealthReport, useGenerateDocument } from '../api/useAi';
import { FiZap, FiActivity, FiFileText, FiCopy, FiCheck } from 'react-icons/fi';

/**
 * ProjectAiReportModal — Automated project health reporting and release notes / docs generation.
 */
export default function ProjectAiReportModal({ isOpen, onClose, projectId }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [activeTab, setActiveTab] = useState('health');
  const [docType, setDocType] = useState('release_notes');
  const [docContext, setDocContext] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [docResult, setDocResult] = useState('');
  const [copied, setCopied] = useState(false);

  const healthMutation = useProjectHealthReport(organizationId, workspaceId);
  const docMutation = useGenerateDocument(organizationId, workspaceId);

  if (!isOpen) return null;

  const handleGenerateHealth = async () => {
    if (!projectId) return;
    const res = await healthMutation.mutateAsync(projectId);
    if (res?.report) setReportResult(res.report);
  };

  const handleGenerateDoc = async () => {
    if (!docContext.trim()) return;
    const res = await docMutation.mutateAsync({ type: docType, context: docContext });
    if (res?.document) setDocResult(res.document);
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-bg-primary rounded-2xl border border-border-primary shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
              <FiZap className="text-white" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Project AI Intelligence</h3>
              <p className="text-xs text-text-tertiary">Health Reports & Automated Documentation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-sm font-semibold px-2 py-1 rounded-lg">
            Close
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border-primary bg-bg-secondary/20 px-4 pt-2 gap-2">
          {[
            { id: 'health', label: 'Health Report', icon: FiActivity },
            { id: 'document', label: 'Generate Docs', icon: FiFileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                  active
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-500/5 rounded-t-lg'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'health' ? (
            <div className="space-y-4">
              <p className="text-text-tertiary">Generate an executive health report summarizing project status, bottlenecks, risks, and action items.</p>
              <button
                onClick={handleGenerateHealth}
                disabled={healthMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {healthMutation.isPending ? 'Generating Report...' : 'Generate Health Report'}
              </button>
              {reportResult && (
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border-primary space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopy(reportResult)}
                      className="flex items-center gap-1 text-[11px] text-brand-500 font-medium"
                    >
                      {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                      {copied ? 'Copied!' : 'Copy Report'}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-text-primary leading-relaxed">{reportResult}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-semibold text-text-primary">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border-primary bg-bg-secondary text-text-primary outline-none focus:border-brand-500"
                >
                  <option value="release_notes">Release Notes</option>
                  <option value="meeting_notes">Structured Meeting Notes</option>
                  <option value="changelog">Changelog Entry</option>
                  <option value="user_story">User Story & Criteria</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-text-primary">Source Context / Rough Notes</label>
                <textarea
                  value={docContext}
                  onChange={(e) => setDocContext(e.target.value)}
                  placeholder="Paste rough notes, commit logs, or feature details..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateDoc}
                disabled={docMutation.isPending || !docContext.trim()}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {docMutation.isPending ? 'Generating Document...' : 'Generate Document'}
              </button>

              {docResult && (
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border-primary space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopy(docResult)}
                      className="flex items-center gap-1 text-[11px] text-brand-500 font-medium"
                    >
                      {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
                      {copied ? 'Copied!' : 'Copy Document'}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-text-primary leading-relaxed">{docResult}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
