import { OrganizationService } from '../services/OrganizationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const orgService = new OrganizationService();

export const create = asyncHandler(async (req, res) => {
  const org = await orgService.create(req.body, req.user._id);
  res
    .status(201)
    .json(new ApiResponse(201, 'Organization created successfully.', { organization: org }));
});

export const getMyOrganizations = asyncHandler(async (req, res) => {
  const orgs = await orgService.getMyOrganizations(req.user._id);
  res.status(200).json(new ApiResponse(200, 'Organizations retrieved.', { organizations: orgs }));
});

export const getMyInvitations = asyncHandler(async (req, res) => {
  const invites = await orgService.getMyInvitations(req.user._id);
  res.status(200).json(new ApiResponse(200, 'Invitations retrieved.', { invitations: invites }));
});

export const getById = asyncHandler(async (req, res) => {
  const org = await orgService.getById(req.params.orgId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Organization retrieved.', { organization: org }));
});

export const update = asyncHandler(async (req, res) => {
  const org = await orgService.update(req.params.orgId, req.body, req.membership);
  res.status(200).json(new ApiResponse(200, 'Organization updated.', { organization: org }));
});

export const deleteOrg = asyncHandler(async (req, res) => {
  await orgService.delete(req.params.orgId, req.membership);
  res.status(204).send();
});
