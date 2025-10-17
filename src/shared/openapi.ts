import type { Express } from 'express';
import { settings } from '../settings';
import { apiReference } from '@scalar/express-api-reference';

export function openapi(app: Express) {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: settings.openapi.spec.title,
      version: settings.openapi.spec.version,
      description: settings.openapi.spec.description,
    },
    servers: [
      {
        url: `http://localhost:${settings.server.port}`,
        description: settings.openapi.spec.description,
      },
    ],
    tags: [
      { name: 'Root', description: settings.openapi.spec.description },
      {
        name: 'Materials',
        description: 'Gerenciamento de materiais recicláveis',
      },
      {
        name: 'Collection Points',
        description: 'Gerenciamento de pontos de coleta',
      },
      { name: 'Users', description: 'Gerenciamento de usuários' },
    ],
    paths: {
      '/': {
        get: {
          tags: ['Root'],
          summary: 'API root endpoint',
          responses: {
            '200': {
              description: 'API information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/health': {
        get: {
          tags: ['Root'],
          summary: 'Health check endpoint',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['ok', 'degraded'] },
                      name: { type: 'string' },
                      database: {
                        type: 'string',
                        enum: ['connected', 'disconnected'],
                      },
                    },
                  },
                },
              },
            },
            '503': {
              description: 'Service is degraded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', enum: ['ok', 'degraded'] },
                      name: { type: 'string' },
                      database: {
                        type: 'string',
                        enum: ['connected', 'disconnected'],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/materials': {
        get: {
          tags: ['Materials'],
          summary: 'List materials',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
              description: 'Número máximo de resultados',
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
              description: 'Número de resultados a pular',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Termo de busca',
            },
            {
              name: 'active',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Filtrar por status ativo',
            },
          ],
          responses: {
            '200': {
              description: 'List of materials',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Material' },
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Materials'],
          summary: 'Create a new material',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    slug: { type: 'string' },
                    description: { type: 'string', maxLength: 500 },
                    active: { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Material created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Material' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '409': {
              description: 'Material already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/materials/{id}': {
        get: {
          tags: ['Materials'],
          summary: 'Get material by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Material found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Material' },
                },
              },
            },
            '400': {
              description: 'Invalid material ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Materials'],
          summary: 'Update a material',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    slug: { type: 'string' },
                    description: { type: 'string', maxLength: 500 },
                    active: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Material updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Material' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '409': {
              description: 'Material slug already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Materials'],
          summary: 'Delete a material',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Material deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid material ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/materials/{id}/points': {
        get: {
          tags: ['Materials'],
          summary: 'Get material with collection points',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Material with collection points',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MaterialWithPoints' },
                },
              },
            },
            '400': {
              description: 'Invalid material ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/points': {
        get: {
          tags: ['Collection Points'],
          summary: 'List collection points',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'active',
              in: 'query',
              schema: { type: 'boolean' },
            },
            {
              name: 'materialIds',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'List of collection points',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Point' },
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Collection Points'],
          summary: 'Create a new collection point',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'name',
                    'address',
                    'latitude',
                    'longitude',
                    'materialIds',
                  ],
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    address: { type: 'string', minLength: 2 },
                    latitude: { type: 'number', minimum: -90, maximum: 90 },
                    longitude: { type: 'number', minimum: -180, maximum: 180 },
                    active: { type: 'boolean', default: true },
                    materialIds: {
                      type: 'array',
                      items: { type: 'string', format: 'uuid' },
                      minItems: 1,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Collection point created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Point' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/points/{id}': {
        get: {
          tags: ['Collection Points'],
          summary: 'Get collection point by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Collection point found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Point' },
                },
              },
            },
            '400': {
              description: 'Invalid point ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Collection point not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Collection Points'],
          summary: 'Update a collection point',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 2 },
                    address: { type: 'string', minLength: 2 },
                    latitude: { type: 'number', minimum: -90, maximum: 90 },
                    longitude: { type: 'number', minimum: -180, maximum: 180 },
                    active: { type: 'boolean' },
                    materialIds: {
                      type: 'array',
                      items: { type: 'string', format: 'uuid' },
                      minItems: 1,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Collection point updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Point' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Collection point or material not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Collection Points'],
          summary: 'Delete a collection point',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Collection point deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid point ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'Collection point not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/points/material/{id}': {
        get: {
          tags: ['Collection Points'],
          summary: 'Get collection points by material ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Collection points found',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Point' },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid material ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                      total: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid query parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: {
                      type: 'string',
                      enum: ['user', 'admin'],
                      default: 'user',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '409': {
              description: 'User already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'User found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '400': {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update a user',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['user', 'admin'] },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '409': {
              description: 'Email already exists',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'User deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        Material: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MaterialWithPoints: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            active: { type: 'boolean' },
            points: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  address: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  active: { type: 'boolean' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Point: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            active: { type: 'boolean' },
            materials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  active: { type: 'boolean' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  };

  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    '/api-docs',
    apiReference({
      theme: 'saturn',
      layout: 'modern',
      spec: {
        url: '/api-docs.json',
      },
    })
  );
}
