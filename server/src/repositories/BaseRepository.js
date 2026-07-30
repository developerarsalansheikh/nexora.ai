/**
 * Base Repository class for Nexora.ai.
 *
 * Architecture (layered, unidirectional):
 *   Controllers → Services → Repositories → Models → MongoDB
 *
 * Every Mongoose collection gets its own repository class that extends BaseRepository.
 * Services NEVER talk to Mongoose directly — they go through repositories.
 *
 * @template T - Mongoose Model type
 *
 * Usage:
 *   class ProjectRepository extends BaseRepository {
 *     constructor() { super(ProjectModel); }
 *   }
 */
export class BaseRepository {
  /**
   * @param {import('mongoose').Model} model - Mongoose model instance
   */
  constructor(model) {
    if (!model) {
      throw new Error('BaseRepository requires a Mongoose model.');
    }
    this.model = model;
  }

  /**
   * Find all documents matching a filter with optional pagination.
   *
   * @param {object} filter - Mongoose filter query
   * @param {object} [options={}]
   * @param {number} [options.page=1]
   * @param {number} [options.limit=20]
   * @param {string} [options.sort='-createdAt']
   * @param {string} [options.populate='']
   * @param {string} [options.select='']
   */
  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt', populate = '', select = '' } = options;
    const skip = (page - 1) * limit;

    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (populate) {
      query = query.populate(populate);
    }
    if (select) {
      query = query.select(select);
    }

    const [data, total] = await Promise.all([query, this.model.countDocuments(filter)]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Find a single document by filter.
   */
  async findOne(filter = {}, options = {}) {
    let query = this.model.findOne(filter);
    if (options.populate) {
      query = query.populate(options.populate);
    }
    if (options.select) {
      query = query.select(options.select);
    }
    return query;
  }

  /**
   * Find a document by its MongoDB _id.
   */
  async findById(id, options = {}) {
    return this.findOne({ _id: id }, options);
  }

  /**
   * Create a new document.
   */
  async create(data) {
    return this.model.create(data);
  }

  /**
   * Update a document by _id and return the updated version.
   */
  async updateById(id, data, options = {}) {
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  /**
   * Soft-delete by _id (sets deletedAt if schema supports it).
   * Falls back to hard delete if no deletedAt field exists.
   */
  async deleteById(id) {
    const doc = await this.model.findById(id);
    if (!doc) {
      return null;
    }
    if (typeof doc.deletedAt !== 'undefined') {
      doc.deletedAt = new Date();
      return doc.save();
    }
    return this.model.findByIdAndDelete(id);
  }

  /**
   * Count documents matching a filter.
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Check if a document matching the filter exists.
   */
  async exists(filter = {}) {
    const result = await this.model.exists(filter);
    return !!result;
  }
}

export default BaseRepository;
