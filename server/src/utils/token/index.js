import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_32_chars_long';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_32_chars_long';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Sign a short-lived access token.
 * @param {object} payload - { id, role, organizationId }
 * @returns {string} Signed JWT
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

/**
 * Sign a long-lived refresh token.
 * @param {object} payload - { id }
 * @returns {string} Signed JWT
 */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/**
 * Generate a cryptographically secure random token (e.g. for reset/verification)
 * @returns {string} 64-character hex string
 */
export const generateRandomToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Hash a plain text token using SHA256 (for secure database storage)
 * @param {string} token
 * @returns {string} Hashed token hex
 */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Attach access and refresh tokens to HttpOnly cookies.
 * @param {import('express').Response} res
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const attachCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins in ms
  });

  // Refresh Token Cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

/**
 * Clear authentication cookies.
 * @param {import('express').Response} res
 */
export const clearCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};
