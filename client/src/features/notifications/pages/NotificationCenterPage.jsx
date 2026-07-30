import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useArchiveNotification,
  useDeleteNotification,
} from '../api/useNotifications';
import { FiBell, FiCheck, FiCheckCircle, FiArchive, FiTrash2, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * NotificationCenterPage — Full notifications page view with tabs and filters.
 */
export default function NotificationCenterPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [tab, setTab] = useState('active'); // active, unread, archived
  const [page, setPage] = useState(1);

  const { data: notifData, isLoading } = useNotifications(organizationId, workspaceId, { status: tab, page, limit: 20 });
  const markReadMutation = useMarkNotificationRead(organizationId, workspaceId);
  const markAllReadMutation = useMarkAllNotificationsRead(organizationId, workspaceId);
  const archiveMutation = useArchiveNotification(organizationId, workspaceId);
  const deleteMutation = useDeleteNotification(organizationId, workspaceId);

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Notification Center</h2>
          <p className="text-xs text-text-tertiary">Manage in-app notifications, mentions, and updates</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="px-3 py-1.5 bg-brand-600/10 hover:bg-brand-600/20 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <FiCheckCircle size={14} />
              Mark All as Read
            </button>
          )}
          <Link
            to="/settings/notifications"
            className="px-3 py-1.5 border border-border-primary hover:bg-bg-tertiary text-text-secondary text-xs font-medium rounded-xl transition-all flex items-center gap-1.5"
          >
            <FiSettings size={14} />
            Preferences
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-border-primary gap-4 text-xs font-semibold">
        {[
          { id: 'active', label: 'All Notifications' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'archived', label: 'Archived' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); }}
            className={`pb-3 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List Container */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-text-tertiary text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-bg-secondary rounded-2xl border border-border-primary space-y-2">
            <FiBell size={32} className="mx-auto text-text-tertiary" />
            <p className="text-sm font-semibold text-text-primary">No notifications found</p>
            <p className="text-xs text-text-tertiary">You're all caught up for this filter.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'border-brand-500/30 bg-brand-500/5'
                  : 'border-border-primary bg-bg-secondary hover:bg-bg-tertiary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  !n.isRead ? 'bg-brand-500 text-white font-bold' : 'bg-bg-tertiary text-text-tertiary'
                }`}>
                  🔔
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{n.title}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-text-tertiary">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.type && <span className="uppercase font-mono font-semibold bg-bg-tertiary px-1.5 py-0.5 rounded">{n.type}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!n.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(n._id)}
                    className="px-2.5 py-1 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 text-xs font-semibold rounded-lg transition-all"
                  >
                    Mark Read
                  </button>
                )}
                {!n.isArchived ? (
                  <button
                    onClick={() => archiveMutation.mutate(n._id)}
                    className="p-2 hover:bg-bg-tertiary text-text-tertiary hover:text-purple-500 rounded-lg transition-all"
                    title="Archive"
                  >
                    <FiArchive size={15} />
                  </button>
                ) : null}
                <button
                  onClick={() => deleteMutation.mutate(n._id)}
                  className="p-2 hover:bg-red-500/10 text-text-tertiary hover:text-red-500 rounded-lg transition-all"
                  title="Delete"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
