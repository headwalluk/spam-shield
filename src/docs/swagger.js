const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

// OpenAPI spec configuration. Paths are sourced from JSDoc annotations in route files.
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Spam Shield API',
      version: '0.1.0',
      description:
        'API for spam detection, IP reputation, and authentication. This is an early draft and will evolve.'
    },
    servers: [{ url: config.auth.baseUrl || `http://localhost:${config.server.listenPort}` }],
    components: {
      securitySchemes: {
        SessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: config.auth.sessionCookieName
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: (config.auth.apiKeyHeader || 'x-api-key').toUpperCase()
        }
      },
      // Reusable request/response models for the API
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            roles: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', description: 'User status key (e.g., active, suspended)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UsersPage: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer', description: 'Total count across all pages (if available)' }
          }
        },
        UserCreateRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' }
          }
        },
        UserUpdateRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' }
          }
        }
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1, minimum: 1 },
          description: 'Page number (1-based)'
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          description: 'Page size'
        },
        EmailFilterParam: {
          in: 'query',
          name: 'email',
          schema: { type: 'string' },
          description: 'Optional email filter'
        }
      }
    }
  },
  // Scan annotated route files (include subdirectories like admin/*)
  apis: ['src/routes/api/v3/*.js', 'src/routes/api/v3/**/*.js']
};
const spec = swaggerJsdoc(options);
module.exports = spec;
