import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/apiError.js';
import { BaseService } from '../BaseService.js';
import { AuthRepository } from '../../repositories/auth/AuthRepository.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} from '../../utils/token/index.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email/index.js';
import Organization from '../../models/Organization.js';
import Member from '../../models/Member.js';
import Session from '../../models/Session.js';
import Workspace from '../../models/Workspace.js';

const authRepo = new AuthRepository();
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export class AuthService extends BaseService {
  constructor() {
    super(authRepo);
  }

  /**
   * Register a new user and either create an organization or join an existing one
   */
  async register(
    { name, username, email, password, organizationName, organizationId },
    ipAddress,
    device,
  ) {
    // 1. Check if email/username already exists
    const existingEmail = await authRepo.findByEmail(email);
    if (existingEmail) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const existingUsername = await authRepo.findByUsername(username);
    if (existingUsername) {
      throw ApiError.conflict('This username is already taken.');
    }

    let targetOrgId = organizationId;
    let userRole = 'member';

    // 2. Resolve Organization
    let defaultWorkspaceId = null;

    if (organizationName) {
      // Create new organization
      const newOrg = await Organization.create({
        name: organizationName,
      });
      targetOrgId = newOrg._id;
      userRole = 'owner'; // Creator becomes organization owner

      // Automatically create a default Workspace for new organizations
      const defaultWorkspace = await Workspace.create({
        name: 'Default Workspace',
        organizationId: targetOrgId,
        description: 'Auto-created default workspace.',
        visibility: 'internal',
      });
      defaultWorkspaceId = defaultWorkspace._id;
    } else {
      // Validate existing organization
      const org = await authRepo.findActiveOrganization(organizationId);
      if (!org) {
        throw ApiError.notFound('Target organization not found.');
      }
      // Find the first available workspace for this org
      const existingWorkspace = await Workspace.findOne({
        organizationId: targetOrgId,
        deletedAt: null,
      });
      defaultWorkspaceId = existingWorkspace?._id ?? null;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Generate email verification tokens
    const rawVerificationToken = generateRandomToken();
    const verificationTokenHash = hashToken(rawVerificationToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5. Create user
    const user = await authRepo.create({
      name,
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: verificationTokenExpires,
    });

    // 6. Create organization membership
    const membership = await Member.create({
      userId: user._id,
      organizationId: targetOrgId,
      role: userRole,
      status: 'active', // can be toggled by verification flows if needed
      workspaceId: defaultWorkspaceId,
    });

    // 7. Send verification email
    const verificationUrl = `${APP_URL}/verify-email?token=${rawVerificationToken}`;
    try {
      await sendVerificationEmail(user.email, user.name, verificationUrl);
    } catch {
      // Log error but don't fail registration
    }

    // 8. Generate session and tokens
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const rawRefreshToken = generateRandomToken();
    const refreshTokenHash = hashToken(rawRefreshToken);

    const session = await authRepo.createSession({
      userId: user._id,
      organizationId: targetOrgId,
      tokenHash: refreshTokenHash,
      device,
      ipAddress,
      expiresAt: sessionExpires,
    });

    const accessToken = signAccessToken({
      id: user._id,
      role: userRole,
      organizationId: targetOrgId,
      sessionId: session._id,
    });

    const refreshToken = signRefreshToken({
      id: user._id,
      sessionId: session._id,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      membership: {
        role: membership.role,
        organizationId: targetOrgId,
        workspaceId: defaultWorkspaceId,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user in the specified organization
   */
  async login({ email, password, organizationId }, ipAddress, device) {
    // 1. Fetch user with sensitive fields
    const user = await authRepo.findByEmailWithSensitiveFields(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // 3. Verify organization membership
    let membership = await authRepo.findUserMembership(user._id, organizationId);

    if (!membership) {
      throw ApiError.forbidden('You do not belong to this organization or membership is inactive.');
    }

    // If membership has no workspaceId, find/assign the default workspace
    if (!membership.workspaceId) {
      const defaultWorkspace = await Workspace.findOne({
        organizationId: membership.organizationId,
        deletedAt: null,
      });
      if (defaultWorkspace) {
        await Member.findByIdAndUpdate(membership._id, { workspaceId: defaultWorkspace._id });
        membership.workspaceId = defaultWorkspace._id;
      }
    }

    // 4. Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // 5. Establish new Session
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const rawRefreshToken = generateRandomToken();
    const refreshTokenHash = hashToken(rawRefreshToken);

    const session = await authRepo.createSession({
      userId: user._id,
      organizationId,
      tokenHash: refreshTokenHash,
      device,
      ipAddress,
      expiresAt: sessionExpires,
    });

    const accessToken = signAccessToken({
      id: user._id,
      role: membership.role,
      organizationId,
      sessionId: session._id,
    });

    const refreshToken = signRefreshToken({
      id: user._id,
      sessionId: session._id,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      membership: {
        role: membership.role,
        organizationId,
        workspaceId: membership.workspaceId ?? null,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout user and revoke their current session
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    try {
      verifyRefreshToken(refreshToken);
      const refreshTokenHash = hashToken(refreshToken);
      await authRepo.invalidateSession(refreshTokenHash);
    } catch {
      // Fail silently on logout token validation failure
    }
  }

  /**
   * Rotate refresh and access tokens, verifying reuse and replay attempts
   */
  async refreshTokens(token, ipAddress, device) {
    if (!token) {
      throw ApiError.unauthorized('No refresh token provided.');
    }

    try {
      verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    const tokenHash = hashToken(token);
    const session = await authRepo.findSession(tokenHash);

    // Refresh Token Reuse Detection
    if (!session) {
      // Try to find if token was previously invalidated (which suggests a replay attack)
      const compromisedSession = await Session.findOne({ tokenHash });
      if (compromisedSession) {
        // Revoke all sessions of the user for safety!
        await authRepo.invalidateAllUserSessions(compromisedSession.userId);
        throw ApiError.unauthorized('Compromised session detected. All sessions terminated.');
      }
      throw ApiError.unauthorized('Invalid or expired session.');
    }

    // Retrieve active membership to check role and tenant state
    const membership = await Member.findOne({
      userId: session.userId,
      organizationId: session.organizationId,
      status: 'active',
      isDeleted: { $ne: true },
    });

    if (!membership) {
      throw ApiError.forbidden('User no longer has access to this organization.');
    }

    // Invalidate the old token/session
    session.isValid = false;
    await session.save();

    // Create a new rotated session
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const rawNewRefreshToken = generateRandomToken();
    const newRefreshTokenHash = hashToken(rawNewRefreshToken);

    const newSession = await authRepo.createSession({
      userId: session.userId,
      organizationId: session.organizationId,
      tokenHash: newRefreshTokenHash,
      device: device || session.device,
      ipAddress: ipAddress || session.ipAddress,
      expiresAt: sessionExpires,
    });

    const accessToken = signAccessToken({
      id: session.userId,
      role: membership.role,
      organizationId: session.organizationId,
      sessionId: newSession._id,
    });

    const refreshToken = signRefreshToken({
      id: session.userId,
      sessionId: newSession._id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify email via verification token
   */
  async verifyEmail(rawToken) {
    const tokenHash = hashToken(rawToken);
    const user = await authRepo.findByVerificationToken(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return { message: 'Email address verified successfully.' };
  }

  /**
   * Request forgot password reset email
   */
  async forgotPassword(email, organizationId) {
    const user = await authRepo.findByEmail(email);
    if (!user) {
      // For security, don't disclose that the user doesn't exist
      return {
        message: 'If the email matches an active account, reset instructions have been sent.',
      };
    }

    const membership = await Member.findOne({
      userId: user._id,
      organizationId,
      status: 'active',
      isDeleted: { $ne: true },
    });

    if (!membership) {
      return {
        message: 'If the email matches an active account, reset instructions have been sent.',
      };
    }

    const rawResetToken = generateRandomToken();
    const resetTokenHash = hashToken(rawResetToken);
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${APP_URL}/reset-password?token=${rawResetToken}`;
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch {
      // Fail silently so email providers don't block response
    }

    return {
      message: 'If the email matches an active account, reset instructions have been sent.',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(rawToken, newPassword) {
    const tokenHash = hashToken(rawToken);
    const user = await authRepo.findByResetToken(tokenHash);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all sessions on password reset
    await authRepo.invalidateAllUserSessions(user._id);

    return { message: 'Password has been reset successfully.' };
  }

  /**
   * Change password (authenticated session)
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await authRepo.findOne({ _id: userId }, { select: '+password' });
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Invalidate all other sessions except current (or invalidate all sessions)
    await authRepo.invalidateAllUserSessions(userId);

    return { message: 'Password changed successfully.' };
  }

  /**
   * Get active user sessions
   */
  async getActiveSessions(userId) {
    return authRepo.findActiveSessions(userId);
  }

  /**
   * Revoke specific session by session ID
   */
  async revokeSession(userId, sessionId) {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      throw ApiError.notFound('Session not found.');
    }
    session.isValid = false;
    await session.save();
    return { message: 'Session revoked successfully.' };
  }
}

export default AuthService;
