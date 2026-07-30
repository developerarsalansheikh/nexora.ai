import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import Project from '../models/Project.js';
import Member from '../models/Member.js';
import ActivityLog from '../models/ActivityLog.js';
import AiLog from '../models/AiLog.js';
import { ApiError } from '../utils/apiError.js';

class ReportService {
  /** Generate specified report data based on reportType and query parameters. */
  async generateReport(reportType, { organizationId, workspaceId, projectId, sprintId, startDate, endDate }) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (reportType) {
      case 'project_progress':
        return this._getProjectProgressReport(workspaceId, projectId);
      case 'sprint_report':
        return this._getSprintReport(sprintId);
      case 'team_productivity':
        return this._getTeamProductivityReport(workspaceId, dateFilter);
      case 'task_completion':
        return this._getTaskCompletionReport(workspaceId, projectId, dateFilter);
      case 'time_tracking':
        return this._getTimeTrackingReport(workspaceId, projectId);
      case 'workload':
        return this._getWorkloadReport(workspaceId);
      case 'ai_usage':
        return this._getAiUsageReport(workspaceId, dateFilter);
      case 'activity':
        return this._getActivityReport(workspaceId, dateFilter);
      default:
        throw ApiError.badRequest(`Unsupported report type: ${reportType}`);
    }
  }

  /** Export report data to CSV formatted string. */
  generateCsv(reportType, reportData) {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      return 'No data available for export.';
    }

    const headers = reportData.columns.map((col) => `"${col.label}"`).join(',');
    const rows = reportData.rows
      .map((row) =>
        reportData.columns
          .map((col) => {
            const val = row[col.key] !== undefined ? row[col.key] : '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(','),
      )
      .join('\n');

    return `${headers}\n${rows}`;
  }

  // ─── Individual Report Builders ───────────────────────────────────────────

  async _getProjectProgressReport(workspaceId, projectId) {
    const query = { workspaceId, deletedAt: null };
    if (projectId) query._id = projectId;

    const projects = await Project.find(query).select('name status category progress startDate endDate').lean();
    const projectIds = projects.map((p) => p._id);
    const tasks = await Task.find({ projectId: { $in: projectIds }, deletedAt: null }).select('projectId status storyPoints').lean();

    const rows = projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId.toString() === p._id.toString());
      const totalTasks = pTasks.length;
      const doneTasks = pTasks.filter((t) => t.status === 'done').length;
      const totalPoints = pTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
      const donePoints = pTasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0);
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        projectName: p.name,
        status: p.status,
        totalTasks,
        doneTasks,
        totalPoints,
        donePoints,
        completionRate: `${completionRate}%`,
      };
    });

    return {
      title: 'Project Progress Report',
      columns: [
        { key: 'projectName', label: 'Project Name' },
        { key: 'status', label: 'Status' },
        { key: 'totalTasks', label: 'Total Tasks' },
        { key: 'doneTasks', label: 'Completed Tasks' },
        { key: 'totalPoints', label: 'Total Story Points' },
        { key: 'donePoints', label: 'Completed Points' },
        { key: 'completionRate', label: 'Completion Rate' },
      ],
      rows,
    };
  }

  async _getSprintReport(sprintId) {
    if (!sprintId) throw ApiError.badRequest('Sprint ID is required for Sprint Report.');
    const sprint = await Sprint.findById(sprintId).populate('projectId', 'name').lean();
    if (!sprint) throw ApiError.notFound('Sprint not found.');

    const tasks = await Task.find({ sprintId, deletedAt: null })
      .select('title type status priority storyPoints estimatedHours loggedHours')
      .lean();

    const rows = tasks.map((t) => ({
      taskTitle: t.title,
      type: t.type,
      status: t.status,
      priority: t.priority,
      storyPoints: t.storyPoints || 0,
      estimatedHours: t.estimatedHours || 0,
      loggedHours: t.loggedHours || 0,
    }));

    return {
      title: `Sprint Report - ${sprint.name}`,
      sprintMeta: {
        name: sprint.name,
        status: sprint.status,
        goal: sprint.goal,
        dates: `${new Date(sprint.startDate).toLocaleDateString()} - ${new Date(sprint.endDate).toLocaleDateString()}`,
      },
      columns: [
        { key: 'taskTitle', label: 'Task Title' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'storyPoints', label: 'Story Points' },
        { key: 'estimatedHours', label: 'Est. Hours' },
        { key: 'loggedHours', label: 'Logged Hours' },
      ],
      rows,
    };
  }

  async _getTeamProductivityReport(workspaceId, dateFilter) {
    const members = await Member.find({ workspaceId, status: 'active' }).populate('userId', 'name email').lean();
    const memberUserIds = members.map((m) => m.userId?._id).filter(Boolean);

    const taskQuery = { workspaceId, deletedAt: null, assignee: { $in: memberUserIds } };
    if (dateFilter.$gte || dateFilter.$lte) taskQuery.updatedAt = dateFilter;

    const tasks = await Task.find(taskQuery).select('assignee status storyPoints loggedHours').lean();

    const rows = members.map((m) => {
      const uId = m.userId?._id?.toString();
      const userTasks = tasks.filter((t) => t.assignee?.toString() === uId);
      const completed = userTasks.filter((t) => t.status === 'done').length;
      const pointsCompleted = userTasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0);
      const hoursLogged = userTasks.reduce((s, t) => s + (t.loggedHours || 0), 0);

      return {
        memberName: m.userId?.name || 'Unknown',
        role: m.role,
        assignedTasks: userTasks.length,
        completedTasks: completed,
        pointsCompleted,
        hoursLogged,
      };
    });

    return {
      title: 'Team Productivity Report',
      columns: [
        { key: 'memberName', label: 'Member Name' },
        { key: 'role', label: 'Role' },
        { key: 'assignedTasks', label: 'Assigned Tasks' },
        { key: 'completedTasks', label: 'Completed Tasks' },
        { key: 'pointsCompleted', label: 'Story Points' },
        { key: 'hoursLogged', label: 'Logged Hours' },
      ],
      rows,
    };
  }

  async _getTaskCompletionReport(workspaceId, projectId, dateFilter) {
    const query = { workspaceId, deletedAt: null };
    if (projectId) query.projectId = projectId;
    if (dateFilter.$gte || dateFilter.$lte) query.createdAt = dateFilter;

    const tasks = await Task.find(query)
      .select('title type status priority storyPoints assignee createdAt updatedAt')
      .populate('assignee', 'name')
      .lean();

    const rows = tasks.map((t) => ({
      taskTitle: t.title,
      type: t.type,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee?.name || 'Unassigned',
      createdDate: new Date(t.createdAt).toLocaleDateString(),
      lastUpdated: new Date(t.updatedAt).toLocaleDateString(),
    }));

    return {
      title: 'Task Completion Report',
      columns: [
        { key: 'taskTitle', label: 'Task Title' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'assignee', label: 'Assignee' },
        { key: 'createdDate', label: 'Created' },
        { key: 'lastUpdated', label: 'Updated' },
      ],
      rows,
    };
  }

  async _getTimeTrackingReport(workspaceId, projectId) {
    const query = { workspaceId, deletedAt: null };
    if (projectId) query.projectId = projectId;

    const tasks = await Task.find(query)
      .select('title estimatedHours loggedHours storyPoints assignee')
      .populate('assignee', 'name')
      .lean();

    const rows = tasks.map((t) => {
      const est = t.estimatedHours || 0;
      const logged = t.loggedHours || 0;
      const variance = logged - est;

      return {
        taskTitle: t.title,
        assignee: t.assignee?.name || 'Unassigned',
        estimatedHours: est,
        loggedHours: logged,
        variance: variance > 0 ? `+${variance} hrs` : `${variance} hrs`,
      };
    });

    return {
      title: 'Time Tracking Report',
      columns: [
        { key: 'taskTitle', label: 'Task Title' },
        { key: 'assignee', label: 'Assignee' },
        { key: 'estimatedHours', label: 'Estimated (hrs)' },
        { key: 'loggedHours', label: 'Logged (hrs)' },
        { key: 'variance', label: 'Variance' },
      ],
      rows,
    };
  }

  async _getWorkloadReport(workspaceId) {
    const members = await Member.find({ workspaceId, status: 'active' }).populate('userId', 'name').lean();
    const tasks = await Task.find({ workspaceId, deletedAt: null, status: { $ne: 'done' } })
      .select('assignee priority storyPoints estimatedHours')
      .lean();

    const rows = members.map((m) => {
      const uId = m.userId?._id?.toString();
      const openTasks = tasks.filter((t) => t.assignee?.toString() === uId);
      const openPoints = openTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
      const estHours = openTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
      const urgentCount = openTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').length;

      return {
        memberName: m.userId?.name || 'Unknown',
        openTaskCount: openTasks.length,
        openStoryPoints: openPoints,
        estimatedHours: estHours,
        highPriorityCount: urgentCount,
      };
    });

    return {
      title: 'Team Workload Distribution Report',
      columns: [
        { key: 'memberName', label: 'Member Name' },
        { key: 'openTaskCount', label: 'Open Tasks' },
        { key: 'openStoryPoints', label: 'Open Story Points' },
        { key: 'estimatedHours', label: 'Est. Hours Remaining' },
        { key: 'highPriorityCount', label: 'High/Urgent Tasks' },
      ],
      rows,
    };
  }

  async _getAiUsageReport(workspaceId, dateFilter) {
    const query = { workspaceId };
    if (dateFilter.$gte || dateFilter.$lte) query.createdAt = dateFilter;

    const logs = await AiLog.find(query).populate('userId', 'name').sort('-createdAt').limit(500).lean();

    const rows = logs.map((l) => ({
      action: l.action,
      user: l.userId?.name || 'Unknown',
      modelUsed: l.modelUsed,
      totalTokens: l.totalTokens || 0,
      status: l.status,
      timestamp: new Date(l.createdAt).toLocaleString(),
    }));

    return {
      title: 'AI Usage Audit Report',
      columns: [
        { key: 'action', label: 'Action' },
        { key: 'user', label: 'User' },
        { key: 'modelUsed', label: 'Model' },
        { key: 'totalTokens', label: 'Total Tokens' },
        { key: 'status', label: 'Status' },
        { key: 'timestamp', label: 'Date' },
      ],
      rows,
    };
  }

  async _getActivityReport(workspaceId, dateFilter) {
    const query = { workspaceId };
    if (dateFilter.$gte || dateFilter.$lte) query.createdAt = dateFilter;

    const activities = await ActivityLog.find(query).populate('actorId', 'name').sort('-createdAt').limit(500).lean();

    const rows = activities.map((a) => ({
      action: a.action,
      entityType: a.entityType,
      actor: a.actorId?.name || 'System',
      description: a.description || '',
      timestamp: new Date(a.createdAt).toLocaleString(),
    }));

    return {
      title: 'Workspace Activity Audit Report',
      columns: [
        { key: 'action', label: 'Action' },
        { key: 'entityType', label: 'Entity' },
        { key: 'actor', label: 'Performed By' },
        { key: 'description', label: 'Description' },
        { key: 'timestamp', label: 'Timestamp' },
      ],
      rows,
    };
  }
}

export default new ReportService();
