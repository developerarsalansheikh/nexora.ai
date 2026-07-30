/**
 * Reusable Mongoose plugin to generate URL-friendly unique slugs before validation.
 */
export default function slugPlugin(schema, options = {}) {
  const sourceField = options.sourceField || 'name';
  const slugField = options.slugField || 'slug';

  schema.add({
    [slugField]: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
  });

  // Standard helper to transform text into URL slug
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text

  schema.pre('validate', async function (next) {
    const doc = this;

    // Only generate slug if the source field is modified, or if the slug is empty
    if (!doc.isModified(sourceField) && doc[slugField]) {
      return next();
    }

    const baseValue = doc[sourceField];
    if (!baseValue) {
      return next();
    }

    const slug = slugify(baseValue);

    // Verify uniqueness and resolve conflict collisions
    const docModel = doc.constructor;
    let count = 0;
    let uniqueSlug = slug;

    while (true) {
      const existingDoc = await docModel.findOne({
        [slugField]: uniqueSlug,
        _id: { $ne: doc._id },
      });

      if (!existingDoc) {
        doc[slugField] = uniqueSlug;
        break;
      }

      count += 1;
      uniqueSlug = `${slug}-${count}`;
    }

    return next();
  });
}
