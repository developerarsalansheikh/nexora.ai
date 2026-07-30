import Joi from 'joi';

const passwordRules = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    'string.min': 'Password must be at least 8 characters long.',
  });

const objectIdPattern = /^[a-f\d]{24}$/i;

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  username: Joi.string().trim().min(3).max(30).lowercase().alphanum().required(),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  password: passwordRules.required(),
  organizationName: Joi.string().trim().min(2).max(100),
  organizationId: Joi.string().pattern(objectIdPattern).message('Invalid organization ID format'),
}).xor('organizationName', 'organizationId');

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  password: Joi.string().required(),
  organizationId: Joi.string()
    .pattern(objectIdPattern)
    .message('Invalid organization ID format'),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required(),
  organizationId: Joi.string()
    .pattern(objectIdPattern)
    .message('Invalid organization ID format')
    .required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  password: passwordRules.required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordRules.required(),
});

export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  username: Joi.string().trim().min(3).max(30).lowercase().alphanum(),
  avatar: Joi.string().uri().allow(''),
}).min(1);
