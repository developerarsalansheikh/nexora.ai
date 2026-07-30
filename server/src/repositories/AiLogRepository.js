import AiLog from '../models/AiLog.js';

export class AiLogRepository {
  /** Create an AI audit log entry. */
  async create(data) {
    return AiLog.create(data);
  }

  /** Find AI logs by workspace for audit display. */
  async findByWorkspace(workspaceId, options = {}) {
    const { page = 1, limit = 30 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AiLog.find({ workspaceId })
        .populate('userId', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      AiLog.countDocuments({ workspaceId }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Get aggregate token usage for a workspace. */
  async getTokenUsage(workspaceId) {
    const result = await AiLog.aggregate([
      { $match: { workspaceId: typeof workspaceId === 'string' ? new (await import('mongoose')).default.Types.ObjectId(workspaceId) : workspaceId } },
      {
        $group: {
          _id: null,
          totalPromptTokens: { $sum: '$promptTokens' },
          totalCompletionTokens: { $sum: '$completionTokens' },
          totalTokens: { $sum: '$totalTokens' },
          totalRequests: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, totalRequests: 0 };
  }
}

export default AiLogRepository;
