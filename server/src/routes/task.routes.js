import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import * as commentController from '../controllers/commentController.js';
import { validateCreateTask, validateUpdateTask } from '../validators/task.validator.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId, :workspaceId, :projectId

router.use(protect);
router.use(requireMembership);

// ─── Tasks Core Operations ───────────────────────────────────────────────────
router.post('/', validateCreateTask, taskController.create);
router.get('/', taskController.list);
router.patch('/reorder', taskController.reorder);

router.get('/:taskId', taskController.getById);
router.patch('/:taskId', validateUpdateTask, taskController.update);
router.delete('/:taskId', taskController.deleteTask);

// ─── Time Tracking & Work Logs ────────────────────────────────────────────────
router.post('/:taskId/worklog', taskController.addWorkLog);

// ─── Watchers ─────────────────────────────────────────────────────────────────
router.post('/:taskId/watch', taskController.toggleWatcher);

// ─── Task Dependencies ────────────────────────────────────────────────────────
router.post('/:taskId/dependencies', taskController.addDependency);
router.delete('/:taskId/dependencies/:targetTaskId', taskController.removeDependency);

// ─── Task Checklists ──────────────────────────────────────────────────────────
router.post('/:taskId/checklist', taskController.addChecklistItem);
router.patch('/:taskId/checklist', taskController.toggleChecklistItem);
router.delete('/:taskId/checklist/:itemId', taskController.removeChecklistItem);

// ─── SubTasks (nested under task) ────────────────────────────────────────────
router.post('/:taskId/subtasks', taskController.createSubTask);
router.get('/:taskId/subtasks', taskController.listSubTasks);
router.patch('/:taskId/subtasks/:subTaskId', taskController.updateSubTask);
router.delete('/:taskId/subtasks/:subTaskId', taskController.deleteSubTask);

// ─── Comments (nested under task) ────────────────────────────────────────────
router.get('/:taskId/comments', commentController.list);
router.post('/:taskId/comments', commentController.create);
router.patch('/:taskId/comments/:commentId', commentController.update);
router.delete('/:taskId/comments/:commentId', commentController.deleteComment);

export default router;
