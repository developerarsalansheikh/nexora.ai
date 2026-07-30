import User from '../../models/User.js';
import Session from '../../models/Session.js';
import Member from '../../models/Member.js';
import Organization from '../../models/Organization.js';
import { BaseRepository } from '../BaseRepository.js';

export class AuthRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email, select sensitive fields like password
   */
  async findByEmailWithSensitiveFields(email) {
    if (!email) return null;
    return User.findOne({ email: email.toLowerCase().trim(), isDeleted: { $ne: true } }).select(
      '+password +emailVerificationToken +emailVerificationExpires +passwordResetToken +passwordResetExpires',
    );
  }

  /**
   * Find user by email (checks all accounts for duplicate email check)
   */
  async findByEmail(email) {
    if (!email) return null;
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Find user by username (checks all accounts for duplicate username check)
   */
  async findByUsername(username) {
    if (!username) return null;
    return User.findOne({ username: username.toLowerCase().trim() });
  }

  /**
   * Find active organization membership for user
   */
  async findUserMembership(userId, organizationId) {
    const filter = { userId, status: 'active', isDeleted: { $ne: true } };
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    return Member.findOne(filter);
  }

  /**
   * Find user by verification token (with select enabled)
   */
  async findByVerificationToken(tokenHash) {
    return User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
      isDeleted: { $ne: true },
    }).select('+emailVerificationToken +emailVerificationExpires');
  }

  /**
   * Find user by reset token (with select enabled)
   */
  async findByResetToken(tokenHash) {
    return User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
      isDeleted: { $ne: true },
    }).select('+passwordResetToken +passwordResetExpires');
  }

  /**
   * Create a new tracking session
   */
  async createSession(sessionData) {
    return Session.create(sessionData);
  }

  /**
   * Find an active session by token hash
   */
  async findSession(tokenHash) {
    return Session.findOne({
      tokenHash,
      isValid: true,
      expiresAt: { $gt: Date.now() },
      isDeleted: { $ne: true },
    });
  }

  /**
   * Invalidate a single session
   */
  async invalidateSession(tokenHash) {
    return Session.findOneAndUpdate({ tokenHash }, { isValid: false }, { new: true });
  }

  /**
   * Invalidate all sessions of a user (e.g. on logout/password change)
   */
  async invalidateAllUserSessions(userId) {
    return Session.updateMany({ userId, isValid: true }, { isValid: false });
  }

  /**
   * Find active sessions of a user
   */
  async findActiveSessions(userId) {
    return Session.find({
      userId,
      isValid: true,
      expiresAt: { $gt: Date.now() },
      isDeleted: { $ne: true },
    });
  }

  /**
   * Validate organization exists and is active
   */
  async findActiveOrganization(organizationId) {
    return Organization.findOne({ _id: organizationId, isDeleted: { $ne: true } });
  }
}

export default AuthRepository;
