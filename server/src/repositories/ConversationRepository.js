import { BaseRepository } from './BaseRepository.js';
import Conversation from '../models/Conversation.js';

export class ConversationRepository extends BaseRepository {
  constructor() {
    super(Conversation);
  }

  /** List user conversations for a workspace, optionally filtered by project. */
  async findByWorkspace(workspaceId, userId, options = {}) {
    const filter = { workspaceId, createdBy: userId, deletedAt: null };
    if (options.projectId) {
      filter.projectId = options.projectId;
    }
    return this.findAll(filter, {
      page: options.page || 1,
      limit: options.limit || 20,
      sort: '-updatedAt',
      select: 'title projectId messages createdAt updatedAt',
    });
  }

  /** Push a message to a conversation thread. */
  async pushMessage(conversationId, message) {
    return Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /** Find conversation with populated creator. */
  async findByIdPopulated(conversationId) {
    return Conversation.findById(conversationId)
      .populate('createdBy', 'name email avatar')
      .lean({ virtuals: true });
  }
}

export default ConversationRepository;
