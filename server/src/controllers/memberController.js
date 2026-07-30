import { MemberService } from '../services/MemberService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const memberService = new MemberService();

export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await memberService.listMembers(req.params.orgId, { page, limit });
  res.status(200).json(new ApiResponse(200, 'Members retrieved.', result));
});

export const invite = asyncHandler(async (req, res) => {
  const member = await memberService.invite(
    req.params.orgId,
    req.body.email,
    req.body.role,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Member invited successfully.', { member }));
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const member = await memberService.acceptInvitation(req.params.orgId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Invitation accepted.', { member }));
});

export const rejectInvitation = asyncHandler(async (req, res) => {
  await memberService.rejectInvitation(req.params.orgId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Invitation rejected.'));
});

export const updateRole = asyncHandler(async (req, res) => {
  const member = await memberService.updateRole(
    req.params.orgId,
    req.params.memberId,
    req.body.role,
    req.membership,
  );
  res.status(200).json(new ApiResponse(200, 'Member role updated.', { member }));
});

export const removeMember = asyncHandler(async (req, res) => {
  await memberService.removeMember(req.params.orgId, req.params.memberId, req.membership);
  res.status(204).send();
});
