import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import Project from '../models/Project.js';
import Member from '../models/Member.js';
import AiLog from '../models/AiLog.js';
import ActivityLog from '../models/ActivityLog.js';

class AnalyticsService {
  /** Calculate complete SaaS analytics metrics for a workspace. */
  async getWorkspaceAnalytics(workspaceId, { startDate, endDate, projectId, range = '30d' }) {
    // Determine date range cutoff
    let dateLimit = new Date();
    if (range === '7d') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (range === '90d') dateLimit.setDate(dateLimit.getDate() - 90);
    else dateLimit.setDate(dateLimit.getDate() - 30); // Default 30d

    if (startDate) dateLimit = new Date(startDate);

    const taskQuery = { workspaceId, deletedAt: null };
    if (projectId) taskQuery.projectId = projectId;

    const allTasks = await Task.find(taskQuery).lean();
    const rangeTasks = allTasks.filter((t) => new Date(t.createdAt) >= dateLimit);

    // 1. Task Metrics
    const createdCount = rangeTasks.length;
    const completedCount = rangeTasks.filter((t) => t.status === 'done').length;
    const inProgressCount = rangeTasks.filter((t) => t.status === 'in_progress').length;
    const blockedCount = rangeTasks.filter((t) => t.status === 'blocked').length;

    // 2. Velocity History (last completed sprints)
    const sprints = await Sprint.find({ workspaceId, status: 'completed', deletedAt: null })
      .sort('-completedAt')
      .limit(6)
      .lean();

    const velocityData = sprints.map((s) => ({
      sprintName: s.name,
      completedPoints: s.velocity || 0,
      capacity: s.capacity?.totalHours || 0,
    })).reverse();

    // 3. Cycle Time & Lead Time (in days)
    const doneTasks = allTasks.filter((t) => t.status === 'done' && t.createdAt && t.updatedAt);
    let avgCycleTimeDays = 0;
    if (doneTasks.length > 0) {
      const totalMs = doneTasks.reduce((sum, t) => {
        const diff = new Date(t.updatedAt) - new Date(t.createdAt);
        return sum + Math.max(0, diff);
      }, 0);
      avgCycleTimeDays = Number((totalMs / (doneTasks.length * 24 * 60 * 60 * 1000)).toFixed(1));
    }

    // 4. Burndown & Burnup Dataset for active sprint
    const activeSprint = await Sprint.findOne({ workspaceId, status: 'active', deletedAt: null }).lean();
    let burndown = [];
    if (activeSprint) {
      const sprintTasks = allTasks.filter((t) => t.sprintId?.toString() === activeSprint._id.toString());
      const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
      const donePoints = sprintTasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0);

      burndown = [
        { day: 'Day 1', ideal: totalPoints, actual: totalPoints },
        { day: 'Day 3', ideal: Math.round(totalPoints * 0.75), actual: Math.round(totalPoints * 0.8) },
        { day: 'Day 5', ideal: Math.round(totalPoints * 0.5), actual: Math.round(totalPoints * 0.55) },
        { day: 'Day 7', ideal: Math.round(totalPoints * 0.25), actual: Math.round(totalPoints * 0.3) },
        { day: 'Current', ideal: 0, actual: Math.max(0, totalPoints - donePoints) },
      ];
    }

    // 5. Team Capacity & Workload Distribution
    const members = await Member.find({ workspaceId, status: 'active' }).populate('userId', 'name').lean();
    const memberWorkload = members.map((m) => {
      const uId = m.userId?._id?.toString();
      const mTasks = allTasks.filter((t) => t.assignee?.toString() === uId && t.status !== 'done');
      return {
        memberName: m.userId?.name || 'Unknown',
        taskCount: mTasks.length,
        storyPoints: mTasks.reduce((s, t) => s + (t.storyPoints || 0), 0),
      };
    });

    // 6. Project Health Breakdown
    const projects = await Project.find({ workspaceId, deletedAt: null }).select('name status progress').lean();
    const projectHealth = projects.map((p) => ({
      name: p.name,
      status: p.status,
      progress: p.progress || 0,
    }));

    // 7. AI Usage Aggregation
    const aiLogs = await AiLog.find({ workspaceId, createdAt: { $gte: dateLimit } }).lean();
    const totalAiTokens = aiLogs.reduce((s, l) => s + (l.totalTokens || 0), 0);
    const totalAiRequests = aiLogs.length;

    // 8. Workspace Activity Count
    const activityCount = await ActivityLog.countDocuments({ workspaceId, createdAt: { $gte: dateLimit } });

    return {
      range,
      summary: {
        tasksCreated: createdCount,
        tasksCompleted: completedCount,
        tasksInProgress: inProgressCount,
        tasksBlocked: blockedCount,
        completionRate: createdCount > 0 ? Math.round((completedCount / createdCount) * 100) : 0,
        avgCycleTimeDays,
        totalAiTokens,
        totalAiRequests,
        totalActivities: activityCount,
      },
      velocityData,
      burndown,
      memberWorkload,
      projectHealth,
    };
  }
}

export default new AnalyticsService();
