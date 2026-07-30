import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  useGenerateTaskDescription,
  useGenerateSubtasks,
  useEstimateStoryPoints,
  useDetectBlockers,
} from '../api/useAi';
import { FiZap, FiFileText, FiList, FiTrendingUp, FiAlertTriangle, FiCheck } from 'react-icons/fi';

/**
 * TaskAiAssistantModal — Contextual AI assistance for Task details/modal.
 */
export default function TaskAiAssistantModal({ isOpen, onClose, taskData, onApplyDescription, onAddSubtasks, onSetStoryPoints }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [activeTab, setActiveTab] = useState('description');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
  const [estimateResult, setEstimateResult] = useState(null);
  const [blockerResult, setBlockerResult] = useState(null);

  const descMutation = useGenerateTaskDescription(organizationId, workspaceId);
  const subtasksMutation = useGenerateSubtasks(organizationId, workspaceId);
  const estimateMutation = useEstimateStoryPoints(organizationId, workspaceId);
  const blockersMutation = useDetectBlockers(organizationId, workspaceId);

  if (!isOpen) return null;

  const handleGenerateDesc = async () => {
    if (!taskData?.title) return;
    const res = await descMutation.mutateAsync(taskData.title);
    if (res?.description) setGeneratedDesc(res.description);
  };

  const handleGenerateSubtasks = async () => {
    const res = await subtasksMutation.mutateAsync(taskData);
    if (res?.subtasks) setGeneratedSubtasks(res.subtasks);
  };

  const handleEstimatePoints = async () => {
    const res = await estimateMutation.mutateAsync(taskData);
    if (res?.estimate) setEstimateResult(res.estimate);
  };

  const handleDetectBlockers = async () => {
    const res = await blockersMutation.mutateAsync(taskData);
    if (res?.analysis) setBlockerResult(res.analysis);
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
              <h3 className="text-sm font-bold text-text-primary">Task AI Intelligence</h3>
              <p className="text-xs text-text-tertiary truncate max-w-[360px]">{taskData?.title || 'Current Task'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-sm font-semibold px-2 py-1 rounded-lg">
            Close
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border-primary bg-bg-secondary/20 px-4 pt-2 gap-2">
          {[
            { id: 'description', label: 'Description', icon: FiFileText },
            { id: 'subtasks', label: 'Subtasks', icon: FiList },
            { id: 'estimate', label: 'Story Points', icon: FiTrendingUp },
            { id: 'blockers', label: 'Blocker Check', icon: FiAlertTriangle },
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
          {activeTab === 'description' && (
            <div className="space-y-4">
              <p className="text-text-tertiary">Generate an AI-powered detailed description and acceptance criteria checklist based on task title.</p>
              <button
                onClick={handleGenerateDesc}
                disabled={descMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {descMutation.isPending ? 'Generating...' : 'Generate Description'}
              </button>
              {generatedDesc && (
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border-primary space-y-3">
                  <pre className="whitespace-pre-wrap font-sans text-text-primary">{generatedDesc}</pre>
                  {onApplyDescription && (
                    <button
                      onClick={() => { onApplyDescription(generatedDesc); onClose(); }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium flex items-center gap-1 hover:bg-green-700"
                    >
                      <FiCheck size={14} /> Apply to Task
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <p className="text-text-tertiary">Break down this task into smaller actionable subtasks automatically.</p>
              <button
                onClick={handleGenerateSubtasks}
                disabled={subtasksMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {subtasksMutation.isPending ? 'Generating Subtasks...' : 'Generate Subtasks'}
              </button>
              {generatedSubtasks.length > 0 && (
                <div className="space-y-2">
                  {generatedSubtasks.map((sub, i) => (
                    <div key={i} className="p-3 rounded-xl bg-bg-tertiary border border-border-primary">
                      <p className="font-semibold text-text-primary">{sub.title}</p>
                      {sub.description && <p className="text-text-tertiary text-[11px] mt-0.5">{sub.description}</p>}
                    </div>
                  ))}
                  {onAddSubtasks && (
                    <button
                      onClick={() => { onAddSubtasks(generatedSubtasks); onClose(); }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium flex items-center gap-1 hover:bg-green-700"
                    >
                      <FiCheck size={14} /> Add {generatedSubtasks.length} Subtasks to Task
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'estimate' && (
            <div className="space-y-4">
              <p className="text-text-tertiary">Get an AI story point estimate using Fibonacci scale (1, 2, 3, 5, 8, 13, 21).</p>
              <button
                onClick={handleEstimatePoints}
                disabled={estimateMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {estimateMutation.isPending ? 'Estimating...' : 'Estimate Points'}
              </button>
              {estimateResult && (
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border-primary space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-brand-500">{estimateResult.storyPoints} Points</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-500">
                      Confidence: {estimateResult.confidence}
                    </span>
                  </div>
                  <p className="text-text-secondary">{estimateResult.reasoning}</p>
                  {onSetStoryPoints && (
                    <button
                      onClick={() => { onSetStoryPoints(estimateResult.storyPoints); onClose(); }}
                      className="mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium flex items-center gap-1 hover:bg-green-700"
                    >
                      <FiCheck size={14} /> Set Points to {estimateResult.storyPoints}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'blockers' && (
            <div className="space-y-4">
              <p className="text-text-tertiary">Analyze task for potential bottlenecks, missing dependencies, or high-risk factors.</p>
              <button
                onClick={handleDetectBlockers}
                disabled={blockersMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FiZap size={14} />
                {blockersMutation.isPending ? 'Analyzing...' : 'Detect Blockers'}
              </button>
              {blockerResult && (
                <div className="space-y-3">
                  {blockerResult.blockers?.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                      <p className="font-semibold">{b.issue}</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold mt-1">Severity: {b.severity}</p>
                    </div>
                  ))}
                  {blockerResult.suggestions?.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      💡 {s}
                    </div>
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
