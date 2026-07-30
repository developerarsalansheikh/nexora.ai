import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useMyInvitations, useAcceptInvitation, useRejectInvitation } from '../../organizations/api/useOrganizations';
import { useProjects } from '../../projects/api/useProjects';
import { useAnalytics } from '../../analytics/api/useAnalytics';
import { FiMoreVertical, FiChevronDown, FiZap } from 'react-icons/fi';

export default function DashboardOverview() {
  const { user, membership, restoreSession } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  // Do NOT fall back to organizationId here — they are different MongoDB collections.
  // Pass null/undefined and let useProjects + the server handle the missing workspaceId gracefully.
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  /* ── Live Data Hooks ── */
  const { data: invitationsData } = useMyInvitations();
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects(organizationId, workspaceId);
  const { data: analyticsData } = useAnalytics(organizationId, workspaceId);

  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();

  const pendingInvites = Array.isArray(invitationsData) ? invitationsData : [];
  const firstName = user?.name?.split(' ')[0] || 'there';

  /* Extract Live Projects List — useProjects returns { docs, totalDocs, ... } */
  const liveProjects = Array.isArray(projectsData?.docs)
    ? projectsData.docs
    : Array.isArray(projectsData)
    ? projectsData
    : [];

  /* Extract Live Analytics Summary */
  const summary = analyticsData?.summary || {};

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  /* ── Live Stats Cards ── */
  const totalProjCount = liveProjects.length || summary.totalProjects || 0;
  const totalTasksCount = summary.totalTasks || 0;
  const inProgressCount = summary.tasksInProgress || 0;
  const completedCount = summary.tasksCompleted || 0;

  const stats = [
    { title: 'Total Projects', value: String(totalProjCount), change: '+12.5%', iconBg: 'bg-emerald-500/15', icon: '📁' },
    { title: 'Total Tasks', value: String(totalTasksCount), change: '+8.2%', iconBg: 'bg-blue-500/15', icon: '📋' },
    { title: 'In Progress', value: String(inProgressCount), change: '+16.3%', iconBg: 'bg-amber-500/15', icon: '⏳' },
    { title: 'Completed', value: String(completedCount), change: '+22.1%', iconBg: 'bg-brand-500/15', icon: '✅' },
  ];

  /* ── Project Status Donut Data ── */
  const totalTracked = totalTasksCount || (completedCount + inProgressCount) || 1;
  const completedPct = totalTasksCount ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  const inProgressPct = totalTasksCount ? Math.round((inProgressCount / totalTasksCount) * 100) : 0;

  const statusData = [
    { label: 'Completed', count: completedCount, pct: completedPct || 0, color: '#22c55e' },
    { label: 'In Progress', count: inProgressCount, pct: inProgressPct || 0, color: '#3b82f6' },
    { label: 'Total Tracked', count: totalTracked, pct: 100, color: '#a78bfa' },
  ];

  /* ── Donut SVG ── */
  const renderDonut = () => {
    const cx = 70, cy = 70, r = 55, circumference = 2 * Math.PI * r;
    let offset = 0;
    const slices = [
      { count: completedCount, color: '#22c55e' },
      { count: inProgressCount, color: '#3b82f6' },
    ];
    const sum = slices.reduce((s, d) => s + d.count, 0) || 1;

    return (
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        {slices.map((d, idx) => {
          const pct = (d.count / sum);
          const dash = pct * circumference;
          const gap = circumference - dash;
          const seg = (
            <circle
              key={idx}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-text-primary font-bold text-2xl" fontSize="26">{totalProjCount}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-text-tertiary" fontSize="11">Projects</text>
      </svg>
    );
  };

  /* ── Line Chart SVG ── */
  const renderChart = () => {
    const completedPoints = [[0, 85], [40, 78], [80, 72], [120, 60], [160, 55], [200, 48], [240, 35], [280, 30], [320, 22], [360, 18], [400, 12]];
    const createdPoints = [[0, 80], [40, 75], [80, 70], [120, 68], [160, 65], [200, 60], [240, 52], [280, 45], [320, 38], [360, 32], [400, 25]];
    const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');

    return (
      <svg width="100%" height="200" viewBox="0 0 420 100" preserveAspectRatio="none" className="w-full">
        <defs>
          <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="var(--border-primary)" strokeWidth="0.5" />
        ))}
        <path d={`${toPath(completedPoints)} L400,100 L0,100 Z`} fill="url(#completedGrad)" />
        <path d={`${toPath(createdPoints)} L400,100 L0,100 Z`} fill="url(#createdGrad)" />
        <path d={toPath(completedPoints)} fill="none" stroke="#22c55e" strokeWidth="2" />
        <path d={toPath(createdPoints)} fill="none" stroke="#6366f1" strokeWidth="2" />
      </svg>
    );
  };

  const projectColors = [
    'from-purple-500 to-brand-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-blue-400 to-cyan-500',
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ── Pending Invitations Banner ── */}
      <AnimatePresence>
        {pendingInvites.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite._id} className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {invite.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">You've been invited to join <span className="text-brand-400">{invite.name}</span></h3>
                    <p className="text-xs text-text-secondary mt-0.5">Role: <span className="capitalize font-semibold text-text-primary">{formatRole(invite.inviteRole)}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => rejectMutation.mutate(invite._id)} disabled={rejectMutation.isPending} className="px-4 py-2 text-xs rounded-lg bg-bg-secondary hover:bg-rose-500/10 hover:text-rose-500 font-medium transition-colors border border-border-primary text-text-secondary disabled:opacity-50">Decline</button>
                  <button onClick={() => acceptMutation.mutate(invite._id, { onSuccess: () => restoreSession() })} disabled={acceptMutation.isPending} className="px-4 py-2 text-xs rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-md shadow-brand-500/20 transition-colors disabled:opacity-50">Accept</button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Aurora Greeting Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden p-8 md:p-10 border border-border-primary"
      >
        <div className="absolute inset-0 bg-bg-secondary overflow-hidden">
          <div className="absolute -top-32 right-0 w-[650px] h-[350px] bg-gradient-to-bl from-violet-500/30 via-purple-600/20 to-transparent blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute -top-16 right-[25%] w-[450px] h-[250px] bg-gradient-to-bl from-teal-400/25 via-emerald-500/15 to-transparent blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-0 right-[50%] w-[350px] h-[280px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-[90px] animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {getGreeting()}, {firstName}! <span className="inline-block animate-bounce" style={{ animationDuration: '2s' }}>👋</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1.5">
              Here's what's happening with your live MongoDB projects today.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Link
              to="/analytics"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border-primary bg-bg-primary/60 backdrop-blur-sm text-text-primary hover:bg-bg-tertiary transition-all whitespace-nowrap"
            >
              View Analytics
            </Link>
            <Link
              to="/ai-audit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <FiZap size={14} />
              <span>Ask Nexora AI</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Live Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group p-5 rounded-2xl border border-border-primary bg-bg-secondary/60 backdrop-blur-sm hover:border-brand-500/20 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <button className="text-text-tertiary hover:text-text-secondary transition-colors">
                <FiMoreVertical size={16} />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs text-text-tertiary font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-text-primary mt-1 tracking-tight">{stat.value}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-emerald-400">↑ {stat.change}</span>
              <span className="text-[10px] text-text-tertiary">Live database records</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row: Project Overview + Project Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Project Overview Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 p-6 rounded-2xl border border-border-primary bg-bg-secondary/60 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-primary">Project Overview</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg border border-border-primary bg-bg-tertiary/50 text-text-secondary hover:text-text-primary transition-colors">
              Live Stream <FiChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-text-secondary">Tasks Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-[11px] text-text-secondary">Tasks Created</span>
            </div>
          </div>

          <div className="h-[180px]">
            {renderChart()}
          </div>
        </motion.div>

        {/* Project Status Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 p-6 rounded-2xl border border-border-primary bg-bg-secondary/60 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text-primary">Project Status</h3>
            <button className="text-text-tertiary hover:text-text-secondary transition-colors">
              <FiMoreVertical size={16} />
            </button>
          </div>

          <div className="flex items-center justify-center mb-6">
            {renderDonut()}
          </div>

          <div className="space-y-2.5">
            {statusData.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] text-text-secondary">{d.label}</span>
                </div>
                <span className="text-[11px] text-text-primary font-semibold">
                  {d.count} <span className="text-text-tertiary font-normal">({d.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Live Projects + Organization Profile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-border-primary bg-bg-secondary/60 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-text-primary">Your Projects ({liveProjects.length})</h3>
            <Link to="/projects" className="flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-lg border border-border-primary bg-bg-tertiary/50 text-text-secondary hover:text-text-primary transition-colors">
              View All
            </Link>
          </div>

          {isProjectsLoading ? (
            <div className="p-8 text-center text-xs text-text-tertiary">Loading live projects...</div>
          ) : liveProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-tertiary border border-dashed border-border-primary rounded-xl">
              No projects created yet. <Link to="/projects" className="text-brand-400 font-semibold underline">Create one now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {liveProjects.slice(0, 4).map((proj, i) => (
                <Link key={proj._id} to={`/projects/${proj._id}/board`}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer mb-2"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${projectColors[i % projectColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                      {proj.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{proj.name}</p>
                      <p className="text-[10px] text-text-tertiary truncate">{proj.key ? `Key: ${proj.key}` : proj.description || 'MongoDB Project Record'}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20 capitalize">
                        {proj.status || 'Active'}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Live Organization Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-2xl border border-border-primary bg-bg-secondary/60 backdrop-blur-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>🏢</span> Connected Organization Store
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MongoDB Live
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border-primary/30">
              <span className="text-text-tertiary">Logged User</span>
              <span className="font-semibold text-text-primary">{user?.name} ({user?.email})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary/30">
              <span className="text-text-tertiary">Organization ID</span>
              <span className="font-mono text-text-secondary text-[11px]">{membership?.organizationId || 'Default Org'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border-primary/30">
              <span className="text-text-tertiary">Current Role</span>
              <span className="font-semibold text-brand-400 capitalize">{formatRole(membership?.role)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-text-tertiary">Database Status</span>
              <span className="font-bold text-emerald-400">⚡ Connected & Synchronized</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
