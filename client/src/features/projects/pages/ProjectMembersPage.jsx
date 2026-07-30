import React, { useState } from 'react';
import { useMembers } from '../../members/api/useMembers';
import { useAddProjectMember, useRemoveProjectMember, useUpdateProjectMemberRole } from '../api/useProjects';

export default function ProjectMembersPage({ project, organizationId, workspaceId }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const { data: orgMembers } = useMembers(organizationId);

  const addMemberMutation = useAddProjectMember(organizationId, workspaceId, project._id);
  const removeMemberMutation = useRemoveProjectMember(organizationId, workspaceId, project._id);
  const updateRoleMutation = useUpdateProjectMemberRole(organizationId, workspaceId, project._id);

  const projectMembers = project.members || [];
  const projectMemberUserIds = projectMembers.map((m) => m.userId?._id || m.userId);

  // Filter available organization members not yet in project
  const availableOrgMembers = orgMembers?.filter(
    (m) => !projectMemberUserIds.includes(m.userId?._id),
  ) || [];

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    addMemberMutation.mutate(
      { userId: selectedUserId, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedUserId('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Member Form */}
      <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 space-y-4">
        <h3 className="text-xs uppercase font-bold text-text-tertiary tracking-wider">Add Team Member to Project</h3>

        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] uppercase font-bold text-text-tertiary">Select Organization Member</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">-- Choose member --</option>
              {availableOrgMembers.map((mem) => (
                <option key={mem.userId?._id || mem._id} value={mem.userId?._id}>
                  {mem.userId?.name} ({mem.userId?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-40 space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-tertiary">Project Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="lead">Project Lead</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedUserId || addMemberMutation.isPending}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity disabled:opacity-50 shrink-0"
          >
            {addMemberMutation.isPending ? 'Adding...' : '+ Add Member'}
          </button>
        </form>
      </div>

      {/* Members List Table */}
      <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-primary bg-bg-tertiary/50 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Project Role</th>
              <th className="px-6 py-3">Added Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {projectMembers.map((mem) => {
              const u = mem.userId || {};
              return (
                <tr key={u._id || mem._id} className="hover:bg-bg-tertiary/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{u.name || 'Member'}</p>
                        <p className="text-[10px] text-text-tertiary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={mem.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({ userId: u._id, role: e.target.value })
                      }
                      className="px-2.5 py-1 text-xs rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:outline-none capitalize"
                    >
                      <option value="lead">Lead</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-text-tertiary">
                    {mem.addedAt ? new Date(mem.addedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => removeMemberMutation.mutate(u._id)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
