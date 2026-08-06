import { createServer } from 'http';
import app from '../dist/server';

// Vercel serverless function handler
export default function handler(req: any, res: any) {
  app(req, res);
}