import { BaseRepository } from './BaseRepository.js';
import User from '../models/User.js';

/**
 * UserRepository — encapsulates all User DB operations.
 * Services must call this instead of accessing the User model directly.
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email and include password hash for auth comparison.
   * @param {string} email
   */
  async findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+password');
  }

  /**
   * Find a user by email (no password).
   * @param {string} email
   */
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase(), deletedAt: null });
  }

  /**
   * Find a user by username.
   * @param {string} username
   */
  async findByUsername(username) {
    return User.findOne({ username: username.toLowerCase(), deletedAt: null });
  }

  /**
   * Store or update the hashed refresh token on the user document.
   * @param {string} userId
   * @param {string|null} hashedToken - Pass null to revoke
   */
  async setRefreshToken(userId, hashedToken) {
    return User.findByIdAndUpdate(userId, { refreshToken: hashedToken }, { new: true });
  }
}

export default UserRepository;
