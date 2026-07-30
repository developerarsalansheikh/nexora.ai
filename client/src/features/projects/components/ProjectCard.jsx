import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToggleFavoriteProject, useArchiveProject } from '../api/useProjects';

export default function ProjectCard({ project, organizationId, workspaceId, onEdit, onDelete, onDuplicate, currentUserId }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleFavorite = useToggleFavoriteProject(organizationId, workspaceId);
  const archiveMutation = useArchiveProject(organizationId, workspaceId);

  const isFavorited = Array.isArray(project.favorites) && project.favorites.includes(currentUserId);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite.mutate(project._id);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    archiveMutation.mutate(project._id);
  };

  const getHealthBadge = () => {
    switch (project.health) {
      case 'at-risk':
        return { label: 'At Risk ⚠️', style: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
      case 'critical':
        return { label: 'Critical 🚨', style: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
      default:
        return { label: 'Healthy ❤️', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    }
  };

  const healthBadge = getHealthBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-brand-500/30 hover:shadow-lg transition-all duration-300"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-bg-tertiary text-text-secondary border border-border-primary uppercase tracking-wider">
              {project.key}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 border border-brand-500/20 capitalize">
              {project.category || 'Engineering'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1 text-sm rounded-lg transition-transform active:scale-125 ${
                isFavorited ? 'text-amber-400' : 'text-text-tertiary hover:text-amber-400'
              }`}
            >
              {isFavorited ? '★' : '☆'}
            </button>

            {/* Context Dropdown Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-xs"
              >
                •••
              </button>

              {menuOpen && (
                <div
                  onMouseLeave={() => setMenuOpen(false)}
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border-primary bg-bg-secondary shadow-xl z-30 py-1"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      onEdit(project);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-2"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      onDuplicate(project);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-2"
                  >
                    📋 Duplicate
                  </button>
                  <button
                    onClick={handleArchiveClick}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                  >
                    📦 Archive
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      onDelete(project);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Name & Description */}
        <Link to={`/projects/${project._id}`} className="block group-hover:text-brand-500 transition-colors">
          <h3 className="text-base font-bold text-text-primary tracking-tight">{project.name}</h3>
        </Link>
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2 min-h-[36px]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-4 border-t border-border-primary space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${healthBadge.style}`}>
            {healthBadge.label}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border-primary capitalize">
            {project.status || 'Active'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[9px] font-bold flex items-center justify-center text-white shrink-0">
              {project.ownerId?.name ? project.ownerId.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="truncate max-w-[110px] text-text-secondary font-medium">
              {project.ownerId?.name || 'Unassigned'}
            </span>
          </div>

          <span>
            {project.members ? `${project.members.length} members` : '1 member'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
