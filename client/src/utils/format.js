/**
 * Utility helper functions for string, date, and currency formatting.
 */

/**
 * Standard Date formatting helper.
 * Returns formats like "Jan 12, 2026".
 * 
 * @param {string|Date} dateVal - Date to parse
 * @returns {string} Formatted output
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Capitalizes the first letter of a string.
 * 
 * @param {string} val - Input value
 * @returns {string} Formatted output
 */
export const capitalize = (val) => {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

/**
 * Formats task priority levels cleanly.
 * 
 * @param {string} priority - Priority value
 * @returns {string} Render-safe name
 */
export const formatPriority = (priority) => {
  if (!priority) return 'Medium';
  return capitalize(priority);
};
