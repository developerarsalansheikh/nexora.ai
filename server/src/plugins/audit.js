import mongoose from 'mongoose';

/**
 * Reusable Mongoose plugin to add audit tracking fields (createdBy, updatedBy).
 */
export default function auditPlugin(schema) {
  schema.add({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  });

  // Track modification audits before updates
  schema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    // If the update has a context user or custom audit, bind it
    if (update && this.options?.userId) {
      this.setUpdate({
        ...update,
        updatedBy: this.options.userId,
      });
    }
    next();
  });
}
