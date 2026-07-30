import { ApiError } from '../utils/apiError.js';

/**
 * Validation middleware factory using a Joi schema.
 * Validates `req.body` and passes clean data through. Errors are formatted as ApiError.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate: 'body' | 'query' | 'params'
 * @returns Express middleware
 *
 * @example
 * router.post('/register', validate(registerSchema), authController.register)
 */
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || 'unknown',
        message: d.message.replace(/["]/g, ''),
      }));
      next(ApiError.validationError(errors));
      return;
    }

    // Replace raw data with sanitized value
    req[source] = value;
    next();
  };
