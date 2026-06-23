import express from 'express';
import { tasksRouter } from './tasks/router.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/tasks', tasksRouter);

  // Centralized error handler.
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal_server_error' });
  });

  return app;
}
