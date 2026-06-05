import 'dotenv/config';
import cors from 'cors';
import express, { Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes/routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: buildCorsOrigin(), credentials: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  const swaggerDocument = readSwaggerDocument();
  if (swaggerDocument) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get('/openapi.json', (_request, response) => response.json(swaggerDocument));
  }

  RegisterRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function buildCorsOrigin(): string | string[] | boolean {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) return true;
  if (origin === '*') return true;
  return origin.split(',').map((item) => item.trim()).filter(Boolean);
}

function readSwaggerDocument(): unknown | null {
  const candidates = [
    path.resolve(process.cwd(), 'docs', 'openapi.json'),
    path.resolve(process.cwd(), 'docs', 'swagger.json'),
  ];
  const openApiPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!openApiPath) return null;

  try {
    return JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
  } catch {
    return null;
  }
}
