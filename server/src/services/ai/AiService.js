import gemini from './GeminiService.js';
import { ConversationRepository } from '../../repositories/ConversationRepository.js';
import { AiLogRepository } from '../../repositories/AiLogRepository.js';
import Task from '../../models/Task.js';
import Sprint from '../../models/Sprint.js';
import ActivityLog from '../../models/ActivityLog.js';
import { ApiError } from '../../utils/apiError.js';

const conversationRepo = new ConversationRepository();
const aiLogRepo = new AiLogRepository();

/**
 * AiService — orchestrates all AI intelligence features.
 */
class AiService {
  /**
   * Log an AI operation for auditing.
   */
  async _log(userId, organizationId, workspaceId, action, usage, status = 'success', error = '') {
    try {
      await aiLogRepo.create({
        organizationId,
        workspaceId,
        userId,
        action,
        modelUsed: usage.model || 'gemini-2.5-flash',
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0,
        status: usage.model === 'heuristic_fallback' ? 'fallback' : status,
        error,
      });
    } catch (err) {
      console.error('[AiService] Failed to log AI action:', err.message);
    }
  }

  // ─── AI Chat Assistant ──────────────────────────────────────────────────────

  /**
   * Send a chat message and get AI response. Creates or appends to conversation thread.
   */
  async chat({ message, conversationId, workspaceId, projectId, organizationId, userId }) {
    let conversation;

    if (conversationId) {
      conversation = await conversationRepo.findById(conversationId);
      if (!conversation) throw ApiError.notFound('Conversation not found.');
    } else {
      // Create new conversation
      conversation = await conversationRepo.create({
        workspaceId,
        projectId: projectId || null,
        createdBy: userId,
        title: message.slice(0, 60) + (message.length > 60 ? '...' : ''),
        messages: [],
      });
    }

    // Push user message
    await conversationRepo.pushMessage(conversation._id, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build context from recent messages
    const thread = await conversationRepo.findById(conversation._id);
    const recentMessages = (thread.messages || []).slice(-10);
    const contextPrompt = recentMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const systemInstruction =
      'You are Nexora AI — an intelligent enterprise project management assistant embedded inside the Nexora.ai SaaS platform. ' +
      'Help users plan tasks, estimate effort, analyze risks, summarize progress, and generate documentation. ' +
      'Be concise, structured, actionable, and professional. Use markdown formatting for readability.';

    const result = await gemini.generateText(
      contextPrompt,
      systemInstruction,
    );

    // Push AI response
    await conversationRepo.pushMessage(conversation._id, {
      role: 'model',
      content: result.text,
      timestamp: new Date(),
    });

    await this._log(userId, organizationId, workspaceId, 'chat', result.usage || {});

    return {
      conversationId: conversation._id,
      response: result.text,
      model: result.model,
    };
  }

  /**
   * List conversations for current user in a workspace.
   */
  async listConversations(workspaceId, userId, options = {}) {
    const result = await conversationRepo.findByWorkspace(workspaceId, userId, options);
    return { docs: result.data, meta: result.meta };
  }

  /**
   * Get a single conversation with full message history.
   */
  async getConversation(conversationId) {
    const conversation = await conversationRepo.findByIdPopulated(conversationId);
    if (!conversation) throw ApiError.notFound('Conversation not found.');
    return conversation;
  }

  // ─── Task Intelligence ──────────────────────────────────────────────────────

  async generateTaskDescription(title, organizationId, workspaceId, userId) {
    const prompt =
      `Generate a professional, detailed task description for a software engineering task with the following title:\n\n` +
      `**Title:** "${title}"\n\n` +
      `Include: overview, acceptance criteria (as a checklist), implementation notes, and edge cases to consider.\n` +
      `Use markdown formatting.`;

    const result = await gemini.generateText(prompt);
    await this._log(userId, organizationId, workspaceId, 'generate_description', result.usage || {});
    return { description: result.text, model: result.model };
  }

  async generateSubtasks(taskData, organizationId, workspaceId, userId) {
    const prompt =
      `Given the following task, generate a list of 3-6 actionable subtasks:\n\n` +
      `**Title:** ${taskData.title}\n` +
      `**Description:** ${taskData.description || 'No description provided'}\n` +
      `**Type:** ${taskData.type || 'task'}\n\n` +
      `Return a JSON array of objects with "title" and "description" fields. Only JSON, no markdown fences.`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'generate_subtasks', result.usage || {});

    return {
      subtasks: Array.isArray(result.data) ? result.data : [],
      model: result.model,
    };
  }

  async estimateStoryPoints(taskData, organizationId, workspaceId, userId) {
    const prompt =
      `Estimate the story points (using Fibonacci scale: 1, 2, 3, 5, 8, 13, 21) for:\n\n` +
      `**Title:** ${taskData.title}\n` +
      `**Description:** ${taskData.description || 'N/A'}\n` +
      `**Type:** ${taskData.type || 'task'}\n\n` +
      `Return JSON: { "storyPoints": <number>, "confidence": "<low|medium|high>", "reasoning": "<brief explanation>" }`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'estimate_points', result.usage || {});

    return {
      estimate: result.data || { storyPoints: 3, confidence: 'medium', reasoning: 'Default estimate.' },
      model: result.model,
    };
  }

  async detectBlockers(taskData, projectId, organizationId, workspaceId, userId) {
    const tasks = await Task.find({ projectId, deletedAt: null }).select('title status priority dependencies').lean();

    const prompt =
      `Analyze the following task and project context to detect potential blockers and dependency issues:\n\n` +
      `**Target Task:** ${taskData.title} (Status: ${taskData.status}, Priority: ${taskData.priority})\n\n` +
      `**All Project Tasks (${tasks.length} total):**\n` +
      tasks.slice(0, 30).map((t) => `- ${t.title} [${t.status}] (Priority: ${t.priority})`).join('\n') +
      `\n\nReturn JSON: { "blockers": [{ "issue": "<description>", "severity": "<low|medium|high>" }], "suggestions": ["<suggestion>"] }`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'detect_blockers', result.usage || {});

    return {
      analysis: result.data || { blockers: [], suggestions: [] },
      model: result.model,
    };
  }

  // ─── Sprint Intelligence ────────────────────────────────────────────────────

  async suggestSprintGoal(projectId, organizationId, workspaceId, userId) {
    const backlogTasks = await Task.find({ projectId, sprintId: null, deletedAt: null })
      .select('title type priority storyPoints')
      .lean();

    const prompt =
      `Based on the following backlog tasks, suggest a clear and actionable sprint goal:\n\n` +
      backlogTasks.slice(0, 20).map((t) => `- ${t.title} [${t.type}] (Priority: ${t.priority}, Points: ${t.storyPoints || '?'})`).join('\n') +
      `\n\nReturn JSON: { "goal": "<sprint goal text>", "focusAreas": ["<area>"], "recommendedTasks": ["<task title>"] }`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'suggest_sprint_goal', result.usage || {});

    return {
      suggestion: result.data || { goal: 'Improve product stability and address top priority items.', focusAreas: [], recommendedTasks: [] },
      model: result.model,
    };
  }

  async predictSprintRisk(sprintId, organizationId, workspaceId, userId) {
    const sprint = await Sprint.findById(sprintId).lean();
    if (!sprint) throw ApiError.notFound('Sprint not found.');

    const sprintTasks = await Task.find({ sprintId, deletedAt: null })
      .select('title status priority storyPoints dueDate assignee')
      .lean();

    const totalPts = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
    const donePts = sprintTasks.filter((t) => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0);

    const prompt =
      `Analyze the following sprint and predict completion risk:\n\n` +
      `**Sprint:** ${sprint.name}\n` +
      `**Status:** ${sprint.status}\n` +
      `**Dates:** ${sprint.startDate?.toISOString()} to ${sprint.endDate?.toISOString()}\n` +
      `**Progress:** ${donePts}/${totalPts} story points completed\n` +
      `**Tasks (${sprintTasks.length}):**\n` +
      sprintTasks.slice(0, 30).map((t) => `- ${t.title} [${t.status}] (${t.storyPoints || 0} pts)`).join('\n') +
      `\n\nReturn JSON: { "riskLevel": "<low|medium|high|critical>", "completionProbability": <0-100>, "risks": ["<risk>"], "recommendations": ["<recommendation>"] }`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'predict_sprint_risk', result.usage || {});

    return {
      prediction: result.data || { riskLevel: 'medium', completionProbability: 60, risks: [], recommendations: [] },
      model: result.model,
    };
  }

  // ─── Project Intelligence ───────────────────────────────────────────────────

  async generateProjectHealthReport(projectId, organizationId, workspaceId, userId) {
    const tasks = await Task.find({ projectId, deletedAt: null })
      .select('title status priority type storyPoints dueDate')
      .lean();

    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const blocked = tasks.filter((t) => t.status === 'blocked').length;
    const bugs = tasks.filter((t) => t.type === 'bug').length;
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

    const prompt =
      `Generate a project health report with the following statistics:\n\n` +
      `Total Tasks: ${total}\n` +
      `Completed: ${done}\n` +
      `In Progress: ${inProgress}\n` +
      `Blocked: ${blocked}\n` +
      `Bugs: ${bugs}\n` +
      `Overdue: ${overdue}\n\n` +
      `Provide: overall health rating (healthy/warning/critical), key highlights, risks, and action items.\n` +
      `Use markdown formatting with headers and bullet lists.`;

    const result = await gemini.generateText(prompt);
    await this._log(userId, organizationId, workspaceId, 'project_health_report', result.usage || {});

    return { report: result.text, model: result.model };
  }

  // ─── Documentation Generation ──────────────────────────────────────────────

  async generateDocument(type, context, organizationId, workspaceId, userId) {
    const prompts = {
      release_notes: `Generate professional release notes based on the following context:\n\n${context}\n\nUse markdown with version header, features list, bug fixes, and improvements.`,
      meeting_notes: `Transform the following rough notes into structured meeting notes:\n\n${context}\n\nUse markdown with attendees, discussion points, decisions made, and action items.`,
      changelog: `Generate a changelog entry from the following information:\n\n${context}\n\nUse Keep a Changelog format with Added, Changed, Fixed, and Removed sections.`,
      user_story: `Write a detailed user story from this requirement:\n\n${context}\n\nInclude: As a [role], I want [feature], so that [benefit]. Plus acceptance criteria.`,
    };

    const prompt = prompts[type] || `Generate documentation for:\n\n${context}`;
    const result = await gemini.generateText(prompt);

    const action = type === 'release_notes' ? 'generate_release_notes' : 'generate_meeting_notes';
    await this._log(userId, organizationId, workspaceId, action, result.usage || {});

    return { document: result.text, model: result.model };
  }

  // ─── Smart Natural Language Search ─────────────────────────────────────────

  async smartSearch(query, workspaceId, organizationId, userId) {
    // Ask Gemini to parse the natural language query into a MongoDB filter
    const prompt =
      `You are a query parser for a project management tool. Convert the following natural language query into a MongoDB filter object for a Task collection.\n\n` +
      `Available fields: title, status (backlog|todo|in_progress|in_review|done|blocked), priority (low|medium|high|urgent), type (story|task|bug|epic|improvement), dueDate (Date), assignee (ObjectId), storyPoints (Number).\n\n` +
      `Query: "${query}"\n\n` +
      `Return JSON: { "filter": { <mongodb filter> }, "sort": "<sort field>", "interpretation": "<human-readable interpretation>" }`;

    const result = await gemini.generateStructuredJson(prompt);
    await this._log(userId, organizationId, workspaceId, 'smart_search', result.usage || {});

    let tasks = [];
    if (result.data?.filter) {
      try {
        const filter = { ...result.data.filter, workspaceId, deletedAt: null };
        tasks = await Task.find(filter)
          .sort(result.data.sort || '-createdAt')
          .limit(30)
          .lean();
      } catch (err) {
        console.error('[AiService] Smart search filter error:', err.message);
      }
    }

    return {
      interpretation: result.data?.interpretation || `Search results for: "${query}"`,
      tasks,
      filter: result.data?.filter || {},
      model: result.model,
    };
  }

  // ─── AI Logs ────────────────────────────────────────────────────────────────

  async getAiLogs(workspaceId, options = {}) {
    return aiLogRepo.findByWorkspace(workspaceId, options);
  }

  async getTokenUsage(workspaceId) {
    return aiLogRepo.getTokenUsage(workspaceId);
  }
}

export default new AiService();
