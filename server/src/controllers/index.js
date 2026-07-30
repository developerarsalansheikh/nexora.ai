/**
 * Controllers barrel export.
 *
 * Architecture note:
 *   Controllers MUST remain thin — HTTP concerns ONLY.
 *   No business logic. No direct database calls.
 *
 *   Controller responsibilities:
 *   ✅ Parse req.body / req.params / req.query
 *   ✅ Call the appropriate Service method
 *   ✅ Send the response using ApiResponse
 *   ❌ Do NOT perform business logic
 *   ❌ Do NOT query the database
 *   ❌ Do NOT handle pagination / filtering logic (move to service)
 *
 * @example
 * // Thin controller pattern:
 * export const createProject = asyncHandler(async (req, res) => {
 *   const project = await ProjectService.create(req.body, req.user.id);
 *   return ApiResponse.created(res, SUCCESS_MESSAGES.CREATED('Project'), project);
 * });
 */

// Future controller exports will be added here as features are built.
// export * from './project.controller.js';
// export * from './task.controller.js';
