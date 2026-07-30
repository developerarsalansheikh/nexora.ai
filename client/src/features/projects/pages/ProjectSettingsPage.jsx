import React, { useState } from 'react';
import { useUpdateProject, useArchiveProject } from '../api/useProjects';

export default function ProjectSettingsPage({ project, organizationId, workspaceId, onOpenDelete }) {
  const [allowPublicComments, setAllowPublicComments] = useState(
    project.settings?.allowPublicComments ?? true,
  );

  const updateMutation = useUpdateProject(organizationId, workspaceId);
  const archiveMutation = useArchiveProject(organizationId, workspaceId);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      projectId: project._id,
      payload: {
        settings: {
          ...project.settings,
          allowPublicComments,
        },
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* General Configuration */}
      <div className="p-6 rounded-2xl border border-border-primary bg-bg-secondary/40 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Project Preferences & Features</h3>
          <p className="text-xs text-text-secondary mt-1">Configure project-level options and collaboration defaults.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border-primary bg-bg-primary/50">
            <div>
              <p className="text-xs font-semibold text-text-primary">Allow Public Comments</p>
              <p className="text-[11px] text-text-tertiary">
                Permit organization members outside the project team to view and post comments.
              </p>
            </div>
            <input
              type="checkbox"
              checked={allowPublicComments}
              onChange={(e) => setAllowPublicComments(e.target.checked)}
              className="w-4 h-4 rounded border-border-primary text-brand-500 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving Preferences...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-rose-500">Danger Zone</h3>
          <p className="text-xs text-text-secondary mt-1">
            Irreversible and destructive actions for this project.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-rose-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-text-primary">Archive this Project</p>
              <p className="text-[11px] text-text-tertiary">
                Mark project as archived. It can be restored at any time from the Archived Projects tab.
              </p>
            </div>
            <button
              onClick={() => archiveMutation.mutate(project._id)}
              disabled={archiveMutation.isPending}
              className="px-4 py-2 text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-semibold transition-colors shrink-0"
            >
              Archive Project
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-xs font-semibold text-rose-500">Delete this Project</p>
              <p className="text-[11px] text-text-tertiary">
                Permanently delete this project and remove member assignments.
              </p>
            </div>
            <button
              onClick={onOpenDelete}
              className="px-4 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition-colors shrink-0"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
