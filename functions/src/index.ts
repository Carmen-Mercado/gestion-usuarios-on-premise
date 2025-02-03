import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import { functionConfig } from './config/firebase';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware - allow all origins with more permissive CORS settings
app.use(cors({ 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes - Note: remove the /api prefix since it's added by Firebase
app.use('/users', userRoutes);

// Export the Express app as a Firebase Cloud Function with public access
export const api = functions
  .runWith(functionConfig)
  .https.onRequest((req, res) => {
    // Add proper error handling for OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }
    
    return app(req, res);
  });
