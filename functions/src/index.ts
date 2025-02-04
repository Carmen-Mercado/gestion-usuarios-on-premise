import { onRequest } from "firebase-functions/v2/https";
import express, { Request, Response, NextFunction } from "express";
import * as logger from "firebase-functions/logger";
import { helloRouter } from './routes/hello.js';

const app = express();

// Middleware to log all requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info("Request received:", {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// Middleware para parsear JSON
app.use(express.json());

// Test route at root level
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API root is working' });
});

// Mount hello router at root level
app.use('/', helloRouter);

// Export the Express app as a Firebase Cloud Function
export const api = onRequest({
  cors: true,
  maxInstances: 10
}, app); 