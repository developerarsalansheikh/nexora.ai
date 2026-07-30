import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useSuggestSprintGoal, usePredictSprintRisk } from '../api/useAi';
import { FiZap, FiTarget, FiShield, FiCheck } from 'react-icons/fi';

/**
 * SprintAiAssistantModal — Contextual AI assistance for Sprints.
 */
export default function SprintAiAssistantModal({ isOpen, onClose, projectId, sprintId, onApplyGoal }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [goalResult, setGoalResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);

  const goalMutation = useSuggestSprintGoal(organizationId, workspaceId);
  const riskMutation = usePredictSprintRisk(organizationId, workspaceId);

  if (!isOpen) return null;

  const handleSuggestGoal = async () => {
    if (!projectId) return;
    const res = await goalMutation.mutateAsync(projectId);
    if (res?.suggestion) setGoalResult(res.suggestion);
  };

  const handlePredictRisk = async () => {
    if (!sprintId) return;
    const res = await riskMutation.mutateAsync(sprintId);
    if (res?.prediction) setRiskResult(res.prediction);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-bg-primary rounded-2xl border border-border-primary shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
              <FiZap className="text-white" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Sprint AI Intelligence</h3>
              <p className="text-xs text-text-tertiary">Goal Generation & Completion Risk Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-sm font-semibold px-2 py-1 rounded-lg">
            Close
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Sprint Goal Suggestion */}
          <div className="p-4 rounded-xl border border-border-primary bg-bg-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary font-bold">
                <FiTarget size={16} className="text-brand-500" />
                <span>Sprint Goal Generator</span>
              </div>
              <button
                onClick={handleSuggestGoal}
                disabled={goalMutation.isPending}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <FiZap size={13} />
                {goalMutation.isPending ? 'Analyzing...' : 'Suggest Goal'}
              </button>
            </div>
            {goalResult && (
              <div className="p-3 rounded-lg bg-bg-tertiary border border-border-primary space-y-2">
                <p className="font-semibold text-text-primary text-sm">{goalResult.goal}</p>
                {goalResult.focusAreas?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {goalResult.focusAreas.map((area, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 text-[10px] font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
                {onApplyGoal && (
                  <button
                    onClick={() => { onApplyGoal(goalResult.goal); onClose(); }}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md font-medium flex items-center gap-1 hover:bg-green-700"
                  >
                    <FiCheck size={13} /> Use This Goal
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Sprint Completion Risk Prediction */}
          {sprintId && (
            <div className="p-4 rounded-xl border border-border-primary bg-bg-secondary/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-primary font-bold">
                  <FiShield size={16} className="text-purple-500" />
                  <span>Completion Risk Predictor</span>
                </div>
                <button
                  onClick={handlePredictRisk}
                  disabled={riskMutation.isPending}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <FiZap size={13} />
                  {riskMutation.isPending ? 'Predicting...' : 'Predict Risk'}
                </button>
              </div>
              {riskResult && (
                <div className="p-3 rounded-lg bg-bg-tertiary border border-border-primary space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      riskResult.riskLevel === 'high' || riskResult.riskLevel === 'critical'
                        ? 'bg-red-500/20 text-red-500'
                        : riskResult.riskLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-green-500/20 text-green-500'
                    }`}>
                      Risk Level: {riskResult.riskLevel}
                    </span>
                    <span className="text-text-secondary font-semibold">
                      {riskResult.completionProbability}% Completion Chance
                    </span>
                  </div>
                  {riskResult.risks?.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-semibold text-text-primary">Identified Risks:</p>
                      {riskResult.risks.map((r, i) => (
                        <p key={i} className="text-red-500 dark:text-red-400 text-[11px]">• {r}</p>
                      ))}
                    </div>
                  )}
                  {riskResult.recommendations?.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-semibold text-text-primary">Recommendations:</p>
                      {riskResult.recommendations.map((rec, i) => (
                        <p key={i} className="text-text-secondary text-[11px]">• {rec}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
