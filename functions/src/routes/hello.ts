import express, { Request, Response } from 'express';

const router = express.Router();

// Simple hello route
router.get('/hello', (_req: Request, res: Response) => {
  res.json({
    message: 'Hello from Firebase Functions!',
    timestamp: new Date().toISOString()
  });
});

export const helloRouter = router; 