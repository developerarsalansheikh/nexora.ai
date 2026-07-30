import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId, :workspaceId

router.use(protect);
router.use(requireMembership);

// ─── AI Chat ────────────────────────────────────────────────────────────────
router.post('/chat', aiController.chat);
router.get('/conversations', aiController.listConversations);
router.get('/conversations/:conversationId', aiController.getConversation);

// ─── Task Intelligence ──────────────────────────────────────────────────────
router.post('/tasks/generate-description', aiController.generateTaskDescription);
router.post('/tasks/generate-subtasks', aiController.generateSubtasks);
router.post('/tasks/estimate-points', aiController.estimateStoryPoints);
router.post('/tasks/detect-blockers', aiController.detectBlockers);

// ─── Sprint Intelligence ────────────────────────────────────────────────────
router.post('/sprints/suggest-goal', aiController.suggestSprintGoal);
router.post('/sprints/predict-risk', aiController.predictSprintRisk);

// ─── Project Intelligence ───────────────────────────────────────────────────
router.post('/projects/health-report', aiController.projectHealthReport);

// ─── Documentation ──────────────────────────────────────────────────────────
router.post('/documents/generate', aiController.generateDocument);

// ─── Smart Search ───────────────────────────────────────────────────────────
router.post('/search', aiController.smartSearch);

// ─── AI Logs & Usage ────────────────────────────────────────────────────────
router.get('/logs', aiController.getAiLogs);
router.get('/usage', aiController.getTokenUsage);

export default router;
