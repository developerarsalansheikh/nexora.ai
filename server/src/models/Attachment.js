import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required.'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required.'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required.'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required.'],
      min: [0, 'File size cannot be negative.'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required.'],
      index: true,
    },
    uploadedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by ID is required.'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
attachmentSchema.plugin(softDeletePlugin);
attachmentSchema.plugin(paginationPlugin);
attachmentSchema.plugin(auditPlugin);

attachmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

attachmentSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Attachment = mongoose.model('Attachment', attachmentSchema);
export default Attachment;
