import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../api/useNotifications';
import { FiBell, FiMail, FiSave, FiCheck } from 'react-icons/fi';

/**
 * NotificationSettingsPage — Matrix of user in-app and email notification preference toggles.
 */
export default function NotificationSettingsPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const { data: preferences, isLoading } = useNotificationPreferences(organizationId, workspaceId);
  const updateMutation = useUpdateNotificationPreferences(organizationId, workspaceId);

  const [formState, setFormState] = useState({ inApp: {}, email: {} });

  useEffect(() => {
    if (preferences) {
      setFormState({
        inApp: preferences.inApp || {},
        email: preferences.email || {},
      });
    }
  }, [preferences]);

  const handleToggle = (channel, key) => {
    setFormState((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key],
      },
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formState);
  };

  if (isLoading) return <div className="py-12 text-center text-xs text-text-tertiary">Loading preferences...</div>;

  const eventTypes = [
    { key: 'task_assigned', label: 'Task Assignments', desc: 'When a task is assigned to you' },
    { key: 'task_mentioned', label: 'Mentions & Comments', desc: 'When someone mentions you in a comment' },
    { key: 'task_updated', label: 'Task Status Changes', desc: 'When a task you follow changes status' },
    { key: 'due_date_reminder', label: 'Due Date Reminders', desc: 'Reminders for upcoming task due dates' },
    { key: 'sprint_updates', label: 'Sprint Events', desc: 'Sprint started, completed, or retrospective updates' },
    { key: 'project_updates', label: 'Project Milestones', desc: 'Project status and milestone changes' },
    { key: 'workspace_announcements', label: 'Workspace Announcements', desc: 'Important announcements from workspace admins' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Notification Preferences</h2>
          <p className="text-xs text-text-tertiary">Choose how and when you want to be notified</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
        >
          <FiSave size={14} />
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-bg-tertiary/50 text-text-tertiary border-b border-border-primary">
            <tr>
              <th className="px-6 py-4 font-semibold">Notification Event</th>
              <th className="px-6 py-4 font-semibold text-center w-28">In-App</th>
              <th className="px-6 py-4 font-semibold text-center w-28">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/50 text-text-primary">
            {eventTypes.map((item) => (
              <tr key={item.key} className="hover:bg-bg-tertiary/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-text-primary">{item.label}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{item.desc}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={formState.inApp?.[item.key] !== false}
                    onChange={() => handleToggle('inApp', item.key)}
                    className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={formState.email?.[item.key] !== false}
                    onChange={() => handleToggle('email', item.key)}
                    className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
