import { AuthService } from '../../services/auth/AuthService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { attachCookies, clearCookies } from '../../utils/token/index.js';

const authService = new AuthService();

/**
 * @desc    Register a new user (with new/existing organization)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
  const device = req.headers['user-agent'] || 'Unknown';

  const result = await authService.register(req.body, ipAddress, device);

  attachCookies(res, result.accessToken, result.refreshToken);

  res.status(201).json(
    new ApiResponse(201, 'User registration completed successfully. Verification email sent.', {
      user: result.user,
      membership: result.membership,
      accessToken: result.accessToken,
    }),
  );
});

/**
 * @desc    Log in user
 * @route   POST /api/v1/auth/login
 * @access  Public (validated organization context required)
 */
export const login = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
  const device = req.headers['user-agent'] || 'Unknown';

  // Merge organizationId from req.organizationId if present (from middleware)
  const loginData = {
    ...req.body,
    organizationId: req.organizationId || req.body.organizationId,
  };

  const result = await authService.login(loginData, ipAddress, device);

  attachCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'Authentication successful.', {
      user: result.user,
      membership: result.membership,
      accessToken: result.accessToken,
    }),
  );
});

/**
 * @desc    Log out user & invalidate session
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logout(token);

  clearCookies(res);

  res.status(200).json(new ApiResponse(200, 'Logged out successfully.'));
});

/**
 * @desc    Rotate access/refresh token pair
 * @route   POST /api/v1/auth/refresh
 * @access  Public (refreshToken required via cookie/body)
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
  const device = req.headers['user-agent'] || 'Unknown';

  const result = await authService.refreshTokens(token, ipAddress, device);

  attachCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'Token rotated successfully.', {
      accessToken: result.accessToken,
    }),
  );
});

/**
 * @desc    Request password reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const organizationId = req.organizationId || req.body.organizationId;

  const result = await authService.forgotPassword(email, organizationId);

  res.status(200).json(new ApiResponse(200, result.message));
});

/**
 * @desc    Reset password using reset token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.status(200).json(new ApiResponse(200, result.message));
});

/**
 * @desc    Verify email address using token
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const result = await authService.verifyEmail(token);

  res.status(200).json(new ApiResponse(200, result.message));
});

/**
 * @desc    Change password (authenticated user)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user._id, req.body);

  clearCookies(res);

  res.status(200).json(new ApiResponse(200, result.message));
});

/**
 * @desc    Get current user details
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // Fetch full membership record to get workspaceId
  const Member = (await import('../../models/Member.js')).default;
  const Workspace = (await import('../../models/Workspace.js')).default;

  let membership = await Member.findOne({
    userId: req.user._id,
    organizationId: req.organizationId,
    status: 'active',
    deletedAt: null,
  });

  // Auto-assign default workspace if not set
  if (membership && !membership.workspaceId) {
    const defaultWorkspace = await Workspace.findOne({
      organizationId: req.organizationId,
      deletedAt: null,
    });
    if (defaultWorkspace) {
      await Member.findByIdAndUpdate(membership._id, { workspaceId: defaultWorkspace._id });
      membership.workspaceId = defaultWorkspace._id;
    }
  }

  res.status(200).json(
    new ApiResponse(200, 'Current user profile retrieved.', {
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        isEmailVerified: req.user.isEmailVerified,
        lastLoginAt: req.user.lastLoginAt,
      },
      membership: {
        role: req.orgRole,
        organizationId: req.organizationId,
        workspaceId: membership?.workspaceId ?? null,
      },
    }),
  );
});

/**
 * @desc    Update profile
 * @route   PATCH /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateMe(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully.', {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    }),
  );
});

/**
 * @desc    List active user sessions
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getActiveSessions(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      'Active user sessions retrieved.',
      sessions.map((s) => ({
        id: s._id,
        device: s.device,
        ipAddress: s.ipAddress,
        lastUsedAt: s.lastUsedAt,
        createdAt: s.createdAt,
      })),
    ),
  );
});

/**
 * @desc    Revoke specific session
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @access  Private
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const result = await authService.revokeSession(req.user._id, req.params.sessionId);

  res.status(200).json(new ApiResponse(200, result.message));
});
