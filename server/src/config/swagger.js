/**
 * OpenAPI 3.0 Specification definition for Nexora.ai REST API.
 */
export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Nexora.ai Enterprise API Engine',
    version: '1.0.0',
    description: 'API engine for AI Project Management, Real-time Kanban, Sprint Planning, Analytics, and Billing SaaS.',
    contact: {
      name: 'Nexora Core Architecture Team',
      url: 'https://nexora.ai',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.nexora.ai/api/v1',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Liveness Health Check Probe',
        responses: {
          200: { description: 'Service is healthy.' },
        },
      },
    },
    '/health/readiness': {
      get: {
        summary: 'Readiness Probe (DB Connection Check)',
        responses: {
          200: { description: 'Service is ready to handle requests.' },
          503: { description: 'Database connection offline.' },
        },
      },
    },
    '/health/metrics': {
      get: {
        summary: 'Performance Metrics Probe',
        responses: {
          200: { description: 'Process memory, uptime, and active connection metrics.' },
        },
      },
    },
  },
};

export default openApiSpec;
