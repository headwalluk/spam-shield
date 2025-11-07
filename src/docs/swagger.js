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
      }
    }
  },
  // Scan annotated route files
  apis: ['src/routes/api/v3/*.js']
};
const spec = swaggerJsdoc(options);
module.exports = spec;
