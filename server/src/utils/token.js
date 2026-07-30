import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
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
 * @throws JsonWebTokenError | TokenExpiredError
 */
export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws JsonWebTokenError | TokenExpiredError
 */
export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/**
 * Attach HttpOnly refresh token cookie to a response.
 * @param {import('express').Response} res
 * @param {string} token
 */
export const attachRefreshCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

/**
 * Clear the refresh token cookie.
 * @param {import('express').Response} res
 */
export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
  });
};
