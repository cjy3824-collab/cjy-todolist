// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CJY TodoList API',
      version: '1.0.0',
      description: '할 일 관리 애플리케이션 API 문서',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 입력하세요',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'ValidationError',
                },
                message: {
                  type: 'string',
                  example: '오류 메시지',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
