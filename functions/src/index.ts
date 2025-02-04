import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import versionedRoutes from './routes/index'; // Import the versioned routes
import { functionConfig } from './config/firebase';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

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

// Routes - Note: remove the /api prefix since it's added by Firebase
app.use('/users', userRoutes);
// Use versioned routes
app.use('/', versionedRoutes); // This will handle all versioned routes

// Export the Express app as a Firebase Cloud Function
export const api = onRequest({
  cors: true,
  maxInstances: 10
}, app); 