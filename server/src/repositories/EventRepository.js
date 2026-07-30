import { BaseRepository } from './BaseRepository.js';
import Event from '../models/Event.js';

export class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }

  /**
   * Find events within a date range for a workspace / project.
   */
  async findByRange(workspaceId, startDate, endDate, options = {}) {
    const { projectId, type, userId } = options;

    const dateRangeFilter = [
      { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      {
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(endDate) },
      },
    ];

    const filter = {
      workspaceId,
      deletedAt: null,
      $or: dateRangeFilter,
    };

    if (projectId) {
      filter.projectId = projectId;
    }

    if (type) {
      filter.type = type;
    }

    // Filter by user using $and to avoid overwriting the date $or
    if (userId) {
      filter.$and = [
        { $or: dateRangeFilter },
        { $or: [{ createdBy: userId }, { attendees: userId }] },
      ];
      delete filter.$or; // $and now handles date range
    }

    return Event.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('attendees', 'name email avatar')
      .sort({ startDate: 1 })
      .lean({ virtuals: true });
  }


  /**
   * Find project milestones.
   */
  async findMilestones(projectId) {
    return Event.find({
      projectId,
      type: 'milestone',
      deletedAt: null,
    })
      .sort({ startDate: 1 })
      .lean({ virtuals: true });
  }
}

export default EventRepository;
