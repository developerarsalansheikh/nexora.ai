import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token/index.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Member from '../models/Member.js';

/**
 * authenticateUser middleware
 * Authenticates user via Bearer token in header or accessToken in cookie.
 * Verifies the session validity and binds user context.
 */
export const authenticateUser = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback to Cookies
  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(ApiError.unauthorized('Authentication required. Please sign in.'));
  }

  // 3. Verify access token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return next(
      ApiError.unauthorized(
        error.name === 'TokenExpiredError'
          ? 'Your session has expired. Please sign in again.'
          : 'Invalid access token.',
      ),
    );
  }

  // 4. Fetch User
  const user = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } }).select('+status');
  if (!user) {
    return next(ApiError.unauthorized('User account no longer exists.'));
  }

  if (user.status === 'suspended') {
    return next(ApiError.forbidden('Your account has been suspended. Please contact support.'));
  }

  // 5. Verify Session is Valid (if a refresh token is attached to this session, we map it)
  if (decoded.sessionId) {
    const session = await Session.findOne({
      _id: decoded.sessionId,
      userId: user._id,
      isValid: true,
      expiresAt: { $gt: Date.now() },
      isDeleted: { $ne: true },
    });
    if (!session) {
      return next(
        ApiError.unauthorized('Session has been revoked or expired. Please sign in again.'),
      );
    }
    req.sessionContext = session;
  }

  // 6. Enforce tenancy & membership check
  const organizationId =
    req.organizationId ||
    req.headers['x-organization-id'] ||
    req.headers['x-org-id'] ||
    decoded.organizationId;
  if (!organizationId) {
    return next(ApiError.badRequest('Organization context is required.'));
  }

  const membership = await Member.findOne({
    userId: user._id,
    organizationId,
    status: 'active',
    isDeleted: { $ne: true },
  });

  if (!membership) {
    return next(
      ApiError.forbidden(
        'Access denied. You do not have an active membership in this organization.',
      ),
    );
  }

  req.user = user;
  req.membership = membership;
  req.orgRole = membership.role;
  req.organizationId = organizationId;

  return next();
});

export default authenticateUser;
