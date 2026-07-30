import mongoose from 'mongoose';

/**
 * Reusable Mongoose plugin to enable soft-delete capabilities.
 * Filters out deleted records from queries by default.
 */
export default function softDeletePlugin(schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  // Query middleware helper to exclude deleted records
  const excludeDeleted = function (next) {
    const query = this.getQuery();

    // Allow explicitly querying deleted items if flag is set
    if (!query.includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  };

  // Pre hooks for queries
  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('updateMany', excludeDeleted);
  schema.pre('updateOne', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  // Pre hooks for aggregate pipelines
  schema.pre('aggregate', function (next) {
    const pipeline = this.pipeline();
    // Check if the pipeline already has a match for isDeleted
    const hasDeletedMatch = pipeline.some(
      (stage) =>
        stage.$match &&
        (stage.$match.isDeleted !== undefined || stage.$match['isDeleted.$ne'] !== undefined),
    );

    if (!hasDeletedMatch) {
      pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
    }
    next();
  });

  // Instance method to perform soft delete
  schema.methods.softDelete = async function (userId = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (userId) {
      this.deletedBy = userId;
    }
    return this.save();
  };

  // Instance method to restore soft-deleted documents
  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };
}
