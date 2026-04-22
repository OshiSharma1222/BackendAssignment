const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Backend Assignment API',
      version: '1.0.0',
      description:
        'Scalable REST API with JWT authentication, role-based access control, and task CRUD. Built with Node.js, Express, Prisma and PostgreSQL (Neon).',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tasks', description: 'Task CRUD endpoints' },
      { name: 'Users', description: 'Admin-only user management' },
    ],
  },
  apis: [path.join(__dirname, '..', 'routes', 'v1', '*.js')],
};

module.exports = swaggerJsdoc(options);
