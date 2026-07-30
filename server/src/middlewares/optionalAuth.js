import { verifyAccessToken } from '../utils/token/index.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Member from '../models/Member.js';

/**
 * optionalAuth middleware
 * Attempts to authenticate the user. If unsuccessful, it continues silently without failing.
 */
export const optionalAuth = async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);

    const user = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } }).select(
      '+status',
    );
    if (!user || user.status === 'suspended') {
      return next();
    }

    if (decoded.sessionId) {
      const session = await Session.findOne({
        _id: decoded.sessionId,
        userId: user._id,
        isValid: true,
        expiresAt: { $gt: Date.now() },
        isDeleted: { $ne: true },
      });
      if (!session) {
        return next();
      }
      req.sessionContext = session;
    }

    const organizationId =
      req.organizationId ||
      req.headers['x-organization-id'] ||
      req.headers['x-org-id'] ||
      decoded.organizationId;
    if (organizationId) {
      const membership = await Member.findOne({
        userId: user._id,
        organizationId,
        status: 'active',
        isDeleted: { $ne: true },
      });

      if (membership) {
        req.user = user;
        req.membership = membership;
        req.orgRole = membership.role;
        req.organizationId = organizationId;
      }
    }
  } catch {
    // Ignore verification errors for optional authentication
  }

  return next();
};

export default optionalAuth;
