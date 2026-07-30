import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProjectList() {
  const projects = [
    {
      id: 'proj-1',
      name: 'Project Polaris',
      key: 'POL',
      description: 'Core infrastructure refactor and multi-region deployment setup.',
      status: 'active',
      health: 'healthy',
      healthScore: 98,
      progress: 68,
      lead: 'Sarah Connor',
      leadAvatar: 'SC',
    },
    {
      id: 'proj-2',
      name: 'Project Aurora',
      key: 'AUR',
      description: 'Next-gen LLM integration and chat agent workflow canvas.',
      status: 'active',
      health: 'at-risk',
      healthScore: 72,
      progress: 42,
      lead: 'Marcus Vance',
      leadAvatar: 'MV',
    },
    {
      id: 'proj-3',
      name: 'Nexora Core System',
      key: 'NCS',
      description: 'Billing system integration, telemetry logging, and org dashboards.',
      status: 'planning',
      health: 'healthy',
      healthScore: 94,
      progress: 12,
      lead: 'Alex Miller',
      leadAvatar: 'AM',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Workspace Projects</h2>
          <p className="text-xs text-text-secondary mt-1">Manage, configure, and monitor active initiatives across Nexora.ai.</p>
        </div>
        <button className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity">
          + Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-bg-tertiary text-text-secondary border border-border-primary">
                  {project.key}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  project.health === 'healthy' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  ❤️ {project.healthScore}%
                </span>
              </div>

              <Link to={`/projects/${project.id}/board`} className="block group-hover:text-brand-500 transition-colors">
                <h3 className="text-base font-bold text-text-primary">{project.name}</h3>
              </Link>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed min-h-[40px]">{project.description}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-border-primary space-y-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-tertiary">Progress</span>
                  <span className="text-text-primary font-semibold">{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[9px] font-bold flex items-center justify-center text-white ring-2 ring-bg-secondary">
                    {project.leadAvatar}
                  </div>
                  <span className="text-text-secondary text-[11px]">Lead: {project.lead}</span>
                </div>
                <span className="text-[10px] text-text-tertiary capitalize">{project.status}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
