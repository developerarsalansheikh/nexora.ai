/**
 * Wraps async Express route handlers to catch rejected promises
 * and forward them to the global error handler — eliminating try-catch boilerplate.
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function} Express-compatible middleware
 *
 * @example
 * router.get('/projects', asyncHandler(ProjectController.list));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
export { asyncHandler };
