/**
 * Validation base module for Nexora.ai.
 *
 * Architecture:
 *   validators/
 *     ├── index.js             ← barrel + shared helpers (this file)
 *     ├── auth.validator.js    ← (future) auth request schemas
 *     ├── project.validator.js ← (future) project request schemas
 *     ├── task.validator.js    ← (future) task request schemas
 *     └── ...
 *
 * Validation runs at the route layer via validateRequest middleware.
 * Controllers remain PURE — zero validation logic inside them.
 */

import { ApiError } from '../utils/apiError.js';

/**
 * Generic request validation middleware factory.
 * Accepts a validator function that receives req and returns an errors array.
 *
 * @param {Function} validatorFn - (req) => string[] | { field, message }[]
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/projects', validateRequest(projectValidator.create), ProjectController.create);
 */
export const validateRequest = (validatorFn) => (req, res, next) => {
  const errors = validatorFn(req);
  if (errors && errors.length > 0) {
    const normalized = errors.map((e) => (typeof e === 'string' ? { message: e } : e));
    next(ApiError.validationError(normalized));
    return;
  }
  next();
};

/**
 * Validates that required fields are present in req.body.
 *
 * @param {string[]} fields - Required field names
 * @returns {Function} Validator function usable with validateRequest
 *
 * @example
 * validateRequest(requireFields(['name', 'email']))
 */
export const requireFields = (fields) => (req) => {
  const errors = [];
  for (const field of fields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      errors.push({ field, message: `${field} is required.` });
    }
  }
  return errors;
};

/**
 * Validates that a MongoDB ObjectId param is valid format.
 *
 * @param {string} paramName - req.params key to validate
 * @returns {Function} Validator function usable with validateRequest
 */
export const validateObjectId =
  (paramName = 'id') =>
  (req) => {
    const id = req.params[paramName];
    const isValid = /^[a-f\d]{24}$/i.test(id);
    return isValid ? [] : [{ field: paramName, message: `Invalid ${paramName} format.` }];
  };
