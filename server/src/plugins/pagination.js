/**
 * Reusable Mongoose plugin for standardized offset-limit pagination.
 */
export default function paginationPlugin(schema) {
  /**
   * Paginates query results.
   * @param {Object} query - Mongo query object
   * @param {Object} options - Pagination options
   * @param {number} [options.page=1] - Current page number
   * @param {number} [options.limit=10] - Number of records per page
   * @param {Object|string} [options.sort] - Sorting rules
   * @param {string|Object} [options.populate] - Populate configuration
   * @param {string} [options.select] - Selected fields projection
   * @returns {Promise<Object>} paginated response container
   */
  schema.statics.paginate = async function (query = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.find(query);

    if (options.select) {
      queryBuilder.select(options.select);
    }

    if (options.sort) {
      queryBuilder.sort(options.sort);
    }

    if (options.populate) {
      queryBuilder.populate(options.populate);
    }

    queryBuilder.skip(skip).limit(limit);

    const [docs, totalDocs] = await Promise.all([
      queryBuilder.exec(),
      this.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
    };
  };
}
