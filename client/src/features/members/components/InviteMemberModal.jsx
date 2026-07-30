import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInviteMember } from '../api/useMembers';


export default function InviteMemberModal({ isOpen, onClose, organizationId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  
  const inviteMutation = useInviteMember(organizationId);

  const ROLES = [
    { value: 'admin', label: 'Admin', desc: 'Can manage settings and members.' },
    { value: 'project_manager', label: 'Project Manager', desc: 'Can manage projects and sprints.' },
    { value: 'team_lead', label: 'Team Lead', desc: 'Can manage team tasks.' },
    { value: 'developer', label: 'Developer', desc: 'Standard contributor.' },
    { value: 'qa', label: 'QA', desc: 'Quality assurance and testing.' },
    { value: 'viewer', label: 'Viewer', desc: 'Read-only access.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate(
      { email, role },
      { onSuccess: () => { setEmail(''); setRole('member'); onClose(); } }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl bg-bg-secondary border border-border-primary shadow-xl"
          >
            <h2 className="text-lg font-bold text-text-primary mb-1">Invite Member</h2>
            <p className="text-xs text-text-secondary mb-6">Send an invitation to join your organization.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors appearance-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} - {r.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 text-xs rounded-xl font-medium border border-border-primary hover:bg-bg-tertiary text-text-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending || !email.trim()}
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
