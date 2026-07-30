/**
 * Standard API response wrapper for Nexora.ai.
 * Enforces a consistent response envelope across all API endpoints.
 *
 * Success: { success: true,  message, data, meta }
 * Error:   { success: false, message, errors }
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable message
   * @param {*} [data=null] - Payload to return
   * @param {object} [meta={}] - Optional metadata (pagination, counts)
   */
  constructor(statusCode, message, data = null, meta = {}) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  /**
   * Sends the response directly via an Express res object.
   * @param {object} res - Express response object
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }

  // ─── Static Factories ────────────────────────────────────────────────────

  static ok(res, message, data, meta) {
    return new ApiResponse(200, message, data, meta).send(res);
  }

  static created(res, message, data) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res, message = 'No content') {
    return new ApiResponse(204, message).send(res);
  }
}

export default ApiResponse;
