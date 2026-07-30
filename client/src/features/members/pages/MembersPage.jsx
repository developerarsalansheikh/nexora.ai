import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useMembers } from '../api/useMembers';
import InviteMemberModal from '../components/InviteMemberModal';
import MemberDetailsDrawer from '../components/MemberDetailsDrawer';

export default function MembersPage() {
  const { membership } = useAuth();
  const organizationId = membership?.organizationId;
  const { data: members, isLoading, isError } = useMembers(organizationId);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const isAdminOrOwner = ['admin', 'owner'].includes(membership?.role);

  const memberList = Array.isArray(members) ? members : (members?.docs ?? []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Members & Roles</h2>
          <p className="text-xs text-text-secondary mt-1">Manage organization members, roles, and access permissions.</p>
        </div>
        {isAdminOrOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
          >
            + Invite Member
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10 text-text-tertiary">Loading members...</div>
      ) : isError ? (
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 text-xs text-center">
          Failed to load members. Please refresh the page.
        </div>
      ) : (
        <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-primary bg-bg-tertiary/50">
                  <th className="px-6 py-3 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">User</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Role</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[10px] uppercase font-bold text-text-tertiary tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {memberList.map((member, i) => (
                  <motion.tr
                    key={member._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-bg-tertiary/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {member.userId?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            {member.userId?.name} {member.userId?._id === membership?.userId && <span className="text-[9px] text-text-tertiary font-normal ml-1">(You)</span>}
                          </p>
                          <p className="text-[10px] text-text-secondary">{member.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20 capitalize">
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        member.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="text-[10px] font-semibold text-brand-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-500/10"
                      >
                        Manage
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={organizationId}
      />

      <MemberDetailsDrawer
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        organizationId={organizationId}
      />
    </div>
  );
}
