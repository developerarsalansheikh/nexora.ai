import { BaseRepository } from './BaseRepository.js';
import Project from '../models/Project.js';

export class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  /**
   * Find all projects in a workspace with filters, search, sorting, and pagination.
   */
  async findByWorkspace(workspaceId, options = {}) {
    const {
      search = '',
      status,
      visibility,
      category,
      isArchived = false,
      isFavorite = false,
      userId,
      organizationId,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = options;

    const isArchivedBool = isArchived === 'true' || isArchived === true;

    const query = {
      isDeleted: { $ne: true },
    };

    if (isArchivedBool) {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null') {
      query.workspaceId = workspaceId;
    } else if (organizationId) {
      query.organizationId = organizationId;
    }

    if (status) {
      query.status = status;
    }

    if (visibility) {
      query.visibility = visibility;
    }

    if (category) {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { key: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    if (isFavorite && userId) {
      query.favorites = userId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [projects, totalDocs] = await Promise.all([
      Project.find(query)
        .populate('ownerId', 'name email avatar')
        .populate('members.userId', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: projects,
      totalDocs,
      limit: limitNum,
      page: parseInt(page, 10),
      totalPages,
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1,
    };
  }

  /** Find project by key within a workspace */
  async findByKey(workspaceId, key) {
    return Project.findOne({
      workspaceId,
      key: key.toUpperCase(),
      deletedAt: null,
    }).lean({ virtuals: true });
  }

  /** Get project by ID with populated references */
  async findByIdPopulated(projectId) {
    return Project.findOne({ _id: projectId, deletedAt: null })
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .populate('settings.defaultAssignee', 'name email avatar')
      .lean({ virtuals: true });
  }

  /** Archive a project */
  async archive(projectId) {
    return Project.findByIdAndUpdate(
      projectId,
      { isArchived: true, archivedAt: new Date(), status: 'archived' },
      { new: true },
    );
  }

  /** Restore an archived project */
  async restore(projectId) {
    return Project.findByIdAndUpdate(
      projectId,
      { isArchived: false, archivedAt: null, status: 'active' },
      { new: true },
    );
  }

  /** Toggle favorite for a user */
  async toggleFavorite(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return null;

    const index = project.favorites.indexOf(userId);
    let isFavorited = false;

    if (index > -1) {
      project.favorites.splice(index, 1);
      isFavorited = false;
    } else {
      project.favorites.push(userId);
      isFavorited = true;
    }

    await project.save();
    return { project, isFavorited };
  }

  /** Add member to project */
  async addMember(projectId, userId, role = 'member') {
    return Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: {
          members: { userId, role, addedAt: new Date() },
        },
      },
      { new: true },
    )
      .populate('members.userId', 'name email avatar')
      .lean({ virtuals: true });
  }

  /** Remove member from project */
  async removeMember(projectId, userId) {
    return Project.findByIdAndUpdate(
      projectId,
      {
        $pull: { members: { userId } },
      },
      { new: true },
    )
      .populate('members.userId', 'name email avatar')
      .lean({ virtuals: true });
  }

  /** Update member role in project */
  async updateMemberRole(projectId, userId, role) {
    return Project.findOneAndUpdate(
      { _id: projectId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true },
    )
      .populate('members.userId', 'name email avatar')
      .lean({ virtuals: true });
  }

  /** Duplicate project metadata */
  async duplicateProject(sourceProjectId, newName, newKey, creatorUserId) {
    const source = await Project.findById(sourceProjectId).lean();
    if (!source) return null;

    const duplicatedData = {
      name: newName,
      key: newKey.toUpperCase(),
      description: `Copy of ${source.name}. ${source.description || ''}`.trim(),
      organizationId: source.organizationId,
      workspaceId: source.workspaceId,
      ownerId: creatorUserId,
      category: source.category,
      status: 'planning',
      visibility: source.visibility,
      color: source.color,
      health: 'healthy',
      settings: source.settings || {},
      members: [{ userId: creatorUserId, role: 'lead', addedAt: new Date() }],
    };

    return Project.create(duplicatedData);
  }
}

export default ProjectRepository;
