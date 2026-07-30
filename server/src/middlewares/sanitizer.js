/**
 * Sanitizer Middleware.
 * Prevents NoSQL Injection by sanitizing '$' and '.' operators from req.body, req.query, and req.params.
 * Also performs basic string XSS sanitization.
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Strip leading '$' and '.' from object keys to prevent MongoDB query operator injection
    const cleanKey = key.replace(/^\$|\./g, '');

    let val = obj[key];
    if (typeof val === 'string') {
      // Basic XSS script tag stripping
      val = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof val === 'object' && val !== null) {
      val = sanitizeObject(val);
    }

    sanitized[cleanKey] = val;
  }
  return sanitized;
}

export function noSqlSanitizer(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

export default noSqlSanitizer;
