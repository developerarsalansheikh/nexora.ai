import { BaseRepository } from './BaseRepository.js';
import Invoice from '../models/Invoice.js';

export class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  /** Find all invoices for an organization. */
  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Invoice.find({ organizationId, deletedAt: null })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments({ organizationId, deletedAt: null }),
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
}

export default InvoiceRepository;
