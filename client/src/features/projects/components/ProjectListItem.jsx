import React from 'react';
import { Link } from 'react-router-dom';
import { useToggleFavoriteProject } from '../api/useProjects';

export default function ProjectListItem({ project, organizationId, workspaceId, onEdit, onDelete, onDuplicate, currentUserId }) {
  const toggleFavorite = useToggleFavoriteProject(organizationId, workspaceId);
  const isFavorited = Array.isArray(project.favorites) && project.favorites.includes(currentUserId);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite.mutate(project._id);
  };

  return (
    <tr className="hover:bg-bg-tertiary/30 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleFavoriteClick}
          className={`text-sm transition-transform active:scale-125 ${
            isFavorited ? 'text-amber-400' : 'text-text-tertiary hover:text-amber-400'
          }`}
        >
          {isFavorited ? '★' : '☆'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-text-secondary uppercase">
        {project.key}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/projects/${project._id}`} className="font-bold text-xs text-text-primary hover:text-brand-500 transition-colors">
          {project.name}
        </Link>
        <p className="text-[10px] text-text-tertiary truncate max-w-xs">{project.description || 'No description'}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">
        {project.category || 'Engineering'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-primary text-text-secondary capitalize">
          {project.status || 'Active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[9px] font-bold flex items-center justify-center text-white shrink-0">
            {project.ownerId?.name ? project.ownerId.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span>{project.ownerId?.name || 'Unassigned'}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/projects/${project._id}/board`}
            className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 px-2 py-1 rounded hover:bg-brand-500/10 transition-colors"
          >
            Board
          </Link>
          <button
            onClick={() => onEdit(project)}
            className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 px-2 py-1 rounded hover:bg-brand-500/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDuplicate(project)}
            className="text-[11px] font-semibold text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-bg-tertiary transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={() => onDelete(project)}
            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
