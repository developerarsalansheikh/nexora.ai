import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useArchiveNotification,
} from '../api/useNotifications';
import { FiBell, FiCheck, FiCheckCircle, FiArchive, FiX, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * NotificationCenterModal — Popover triggered by Bell icon in AppLayout header.
 */
export default function NotificationCenterModal({ isOpen, onClose }) {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const { data: notifData } = useNotifications(organizationId, workspaceId, { status: 'active', limit: 10 });
  const markReadMutation = useMarkNotificationRead(organizationId, workspaceId);
  const markAllReadMutation = useMarkAllNotificationsRead(organizationId, workspaceId);
  const archiveMutation = useArchiveNotification(organizationId, workspaceId);

  if (!isOpen) return null;

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-12 top-16 w-96 max-w-[90vw] rounded-2xl border border-border-primary bg-bg-secondary/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary bg-bg-tertiary/40">
          <div className="flex items-center gap-2">
            <FiBell className="text-brand-500" size={16} />
            <h3 className="text-xs font-bold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="p-1 text-[11px] text-brand-500 font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary">
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* List Body */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5 text-xs">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-text-tertiary">
              <FiCheckCircle size={24} className="mx-auto mb-2 text-green-500/60" />
              <p className="font-medium">All caught up!</p>
              <p className="text-[10px] mt-0.5">No unread notifications right now.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-xl border transition-all duration-150 relative group ${
                  !n.isRead
                    ? 'border-brand-500/30 bg-brand-500/5'
                    : 'border-border-primary/60 bg-bg-primary/40 hover:bg-bg-tertiary'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-xs leading-tight">{n.title}</p>
                    <p className="text-[11px] text-text-secondary mt-1">{n.message}</p>
                    <span className="text-[9px] text-text-tertiary mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(n._id)}
                        className="p-1 hover:text-brand-500 text-text-tertiary"
                        title="Mark as read"
                      >
                        <FiCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => archiveMutation.mutate(n._id)}
                      className="p-1 hover:text-purple-500 text-text-tertiary"
                      title="Archive"
                    >
                      <FiArchive size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="p-2.5 border-t border-border-primary text-center bg-bg-tertiary/20">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 flex items-center justify-center gap-1"
          >
            <span>View Notification Center</span>
            <FiExternalLink size={12} />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
