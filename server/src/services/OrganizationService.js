import { BaseService } from './BaseService.js';
import { OrganizationRepository } from '../repositories/OrganizationRepository.js';
import { MemberRepository } from '../repositories/MemberRepository.js';
import { ApiError } from '../utils/apiError.js';

const orgRepo = new OrganizationRepository();
const memberRepo = new MemberRepository();

export class OrganizationService extends BaseService {
  constructor() {
    super(orgRepo);
  }

  /** Create a new organization and add creator as owner-member. */
  async create(data, userId) {
    const org = await orgRepo.create({ ...data, createdBy: userId });

    // Auto-add creator as an owner member
    await memberRepo.create({
      organizationId: org._id,
      userId,
      role: 'owner',
      status: 'active',
      createdBy: userId,
    });

    return org;
  }

  /** Get all organizations the user is a member of. */
  async getMyOrganizations(userId) {
    const memberships = await memberRepo.findAll({ userId, status: 'active', deletedAt: null });
    const orgIds = memberships.data.map((m) => m.organizationId);
    const orgs = await orgRepo.findAll({ _id: { $in: orgIds }, deletedAt: null });
    return orgs;
  }

  /** Get all pending organization invitations for the user. */
  async getMyInvitations(userId) {
    const memberships = await memberRepo.findAll({ userId, status: 'invited', deletedAt: null });
    const orgIds = memberships.data.map((m) => m.organizationId);
    const orgs = await orgRepo.findAll({ _id: { $in: orgIds }, deletedAt: null });
    // Attach the role from the invite to the org object for frontend context
    const enrichedOrgs = orgs.data.map(org => {
      const invite = memberships.data.find(m => m.organizationId.toString() === org._id.toString());
      return { ...org.toObject(), inviteRole: invite.role };
    });
    return { ...orgs, data: enrichedOrgs };
  }

  /** Get a single org by ID — user must be a member. */
  async getById(orgId, userId) {
    const isMember = await memberRepo.isMember(orgId, userId);
    if (!isMember) {
      throw ApiError.forbidden('You do not have access to this organization.');
    }
    const org = await orgRepo.findById(orgId);
    if (!org) {
      throw ApiError.notFound('Organization not found.');
    }
    return org;
  }

  /** Update an organization — only owner/admin can update. */
  async update(orgId, data, membership) {
    if (!['owner', 'admin'].includes(membership.role)) {
      throw ApiError.forbidden('Only owners and admins can update an organization.');
    }
    const updated = await orgRepo.updateById(orgId, data);
    if (!updated) {
      throw ApiError.notFound('Organization not found.');
    }
    return updated;
  }

  /** Soft-delete an organization — only owner can delete. */
  async delete(orgId, membership) {
    if (membership.role !== 'owner') {
      throw ApiError.forbidden('Only the organization owner can delete it.');
    }
    return orgRepo.deleteById(orgId);
  }
}

export default OrganizationService;
