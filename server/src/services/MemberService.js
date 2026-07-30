import { BaseService } from './BaseService.js';
import { MemberRepository } from '../repositories/MemberRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ApiError } from '../utils/apiError.js';

const memberRepo = new MemberRepository();
const userRepo = new UserRepository();

export class MemberService extends BaseService {
  constructor() {
    super(memberRepo);
  }

  /** List all members of an organization. */
  async listMembers(organizationId, options = {}) {
    return memberRepo.findAll(
      { organizationId, deletedAt: null },
      { populate: { path: 'userId', select: 'name username email avatar status' }, ...options },
    );
  }

  /** Invite a user to an organization by email. */
  async invite(organizationId, email, role, inviterId) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw ApiError.notFound(`No user found with email '${email}'.`);
    }

    const already = await memberRepo.isMember(organizationId, user._id);
    if (already) {
      throw ApiError.conflict('User is already a member of this organization.');
    }

    return memberRepo.create({
      organizationId,
      userId: user._id,
      role: role || 'member',
      status: 'invited',
      createdBy: inviterId,
    });
  }

  /** Accept an invitation to join an organization. */
  async acceptInvitation(organizationId, userId) {
    const member = await memberRepo.findOne({ organizationId, userId, deletedAt: null });
    if (!member) {
      throw ApiError.notFound('Invitation not found.');
    }
    if (member.status === 'active') {
      throw ApiError.badRequest('You are already an active member of this organization.');
    }
    return memberRepo.updateById(member._id, { status: 'active' });
  }

  /** Reject an invitation to join an organization. */
  async rejectInvitation(organizationId, userId) {
    const member = await memberRepo.findOne({ organizationId, userId, deletedAt: null });
    if (!member) {
      throw ApiError.notFound('Invitation not found.');
    }
    if (member.status === 'active') {
      throw ApiError.badRequest('Cannot reject an active membership. You must leave or be removed.');
    }
    return memberRepo.deleteById(member._id);
  }

  /** Update a member's role — only owner can change roles. */
  async updateRole(organizationId, memberId, newRole, membership) {
    if (membership.role !== 'owner') {
      throw ApiError.forbidden('Only the organization owner can change member roles.');
    }
    const member = await memberRepo.findOne({ _id: memberId, organizationId });
    if (!member) {
      throw ApiError.notFound('Member not found.');
    }
    if (member.role === 'owner' && newRole !== 'owner') {
      throw ApiError.forbidden("Cannot change the owner's role.");
    }
    return memberRepo.updateById(memberId, { role: newRole });
  }

  /** Remove a member from an organization. */
  async removeMember(organizationId, memberId, membership) {
    if (!['owner', 'admin'].includes(membership.role)) {
      throw ApiError.forbidden('Only owners and admins can remove members.');
    }
    const member = await memberRepo.findOne({ _id: memberId, organizationId });
    if (!member) {
      throw ApiError.notFound('Member not found.');
    }
    if (member.role === 'owner') {
      throw ApiError.forbidden('Cannot remove the organization owner.');
    }
    return memberRepo.deleteById(memberId);
  }
}

export default MemberService;
