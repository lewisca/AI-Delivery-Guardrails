import { Router } from 'express';
import { validateTaskInput } from './validate.js';
import * as repo from './repo.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await repo.listTasks());
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const { valid, errors, value } = validateTaskInput(req.body);
    if (!valid) return res.status(400).json({ errors });
    res.status(201).json(await repo.createTask(value));
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await repo.getTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'not_found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const ok = await repo.deleteTask(req.params.id);
    if (!ok) return res.status(404).json({ error: 'not_found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
