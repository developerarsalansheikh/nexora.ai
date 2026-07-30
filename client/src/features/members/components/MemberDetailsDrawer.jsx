import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateMemberRole, useRemoveMember } from '../api/useMembers';
import { useAuth } from '../../../context/AuthContext';

export default function MemberDetailsDrawer({ isOpen, onClose, member, organizationId }) {
  const { membership: currentUserMembership } = useAuth();
  const updateRoleMutation = useUpdateMemberRole(organizationId);
  const removeMutation = useRemoveMember(organizationId);

  const [selectedRole, setSelectedRole] = useState('');

  const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'developer', label: 'Developer' },
    { value: 'qa', label: 'QA' },
    { value: 'viewer', label: 'Viewer' },
  ];

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  const canManage = ['owner', 'admin'].includes(currentUserMembership?.role) && member?.role !== 'owner' && currentUserMembership?.userId !== member?.userId?._id;

  const handleUpdateRole = () => {
    if (selectedRole !== member.role) {
      updateRoleMutation.mutate({ memberId: member._id, role: selectedRole });
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this member from the organization?')) {
      removeMutation.mutate(member._id, {
        onSuccess: onClose
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && member && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-bg-primary/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-bg-secondary border-l border-border-primary shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border-primary">
              <h2 className="text-sm font-bold text-text-primary">Member Details</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-tertiary text-text-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-500 to-pink-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {member.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{member.userId?.name}</h3>
                  <p className="text-xs text-text-secondary">{member.userId?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                    member.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                  }`}>
                    {member.status}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20 capitalize">
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Management Section */}
              {canManage && (
                <div className="space-y-6 pt-6 border-t border-border-primary">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-text-tertiary">Change Role</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleUpdateRole}
                        disabled={selectedRole === member.role || updateRoleMutation.isPending}
                        className="px-4 py-2 text-xs rounded-xl bg-bg-tertiary hover:bg-bg-primary font-medium text-text-primary border border-border-primary transition-colors disabled:opacity-50"
                      >
                        {updateRoleMutation.isPending ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] uppercase font-bold text-rose-500">Danger Zone</label>
                    <button
                      onClick={handleRemove}
                      disabled={removeMutation.isPending}
                      className="w-full px-4 py-2 text-xs rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-medium border border-rose-500/20 transition-colors disabled:opacity-50"
                    >
                      {removeMutation.isPending ? 'Removing...' : 'Remove from Organization'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
