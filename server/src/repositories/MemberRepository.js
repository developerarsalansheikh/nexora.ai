import { BaseRepository } from './BaseRepository.js';
import Member from '../models/Member.js';

export class MemberRepository extends BaseRepository {
  constructor() {
    super(Member);
  }

  /** Find all members of an organization */
  async findByOrganization(organizationId, options = {}) {
    return this.findAll({ organizationId, deletedAt: null }, options);
  }

  /** Find a specific member within an org */
  async findOrgMember(organizationId, userId) {
    return Member.findOne({ organizationId, userId, deletedAt: null });
  }

  /** Check if user is already a member */
  async isMember(organizationId, userId) {
    return this.exists({ organizationId, userId, deletedAt: null });
  }
}

export default MemberRepository;
