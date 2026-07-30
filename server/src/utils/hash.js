import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * @param {string} password - Plain password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password - Candidate password
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);
