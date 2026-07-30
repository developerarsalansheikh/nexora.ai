import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const invoiceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
      index: true,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    billingPeriodStart: {
      type: Date,
      required: true,
    },
    billingPeriodEnd: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: String,
        amount: Number,
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

invoiceSchema.plugin(softDeletePlugin);
invoiceSchema.plugin(paginationPlugin);
invoiceSchema.plugin(auditPlugin);

invoiceSchema.set('toJSON', { virtuals: true, versionKey: false });
invoiceSchema.set('toObject', { virtuals: true, versionKey: false });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
