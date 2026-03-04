import {
  addTask,
  deleteTaskById,
  getFilteredTasks,
  getTaskById,
  updateTaskById,
} from '../services/taskService';
import { Controller } from '../utils/controllerWr';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    userId?: string; // Assuming user ID is stored in req.user
  };
}

const verifyUser = (req: AuthRequest, res: Response): string | undefined => {
  const userId = req.user?.userId; // Assuming user is set by authMiddleware

  if (!userId) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized: User ID not found',
    });
    return undefined;
  }
  return userId;
};

export const addTaskCtrl: Controller = async (req, res) => {
  const userId = verifyUser(req, res);
  if (!userId) {
    return;
  }
  const data = req.body;
  const tasks = await addTask(userId, data);
  if (!tasks) {
    res.status(404).json({
      status: 404,
      message: 'User not found',
    });
    return;
  }

  res.status(201).json({
    status: 201,
    message: 'Successfully added task',
    data: tasks,
  });
};

export const updateTaskCtrl: Controller = async (req, res) => {
  const userId = verifyUser(req, res);
  if (!userId) {
    return;
  }
  const { id } = req.params;
  const data = req.body;
  const updatedTask = await updateTaskById(userId, id, data);
  if (!updatedTask) {
    res.status(404).json({
      status: 404,
      message: 'User or Task not found',
    });
    return;
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully updated task',
    data: updatedTask,
  });
};

export const getTaskCtrl: Controller = async (req, res) => {
  const userId = verifyUser(req, res);
  if (!userId) {
    return;
  }

  const { id } = req.params;
  const task = await getTaskById(userId, id);
  if (!task) {
    res.status(404).json({
      status: 404,
      message: 'Task not found',
    });
    return;
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved task',
    data: task,
  });
};

export const getAllTasksCtrl: Controller = async (req, res) => {
  const userId = verifyUser(req, res);
  if (!userId) {
    return;
  }

  const search = req.query.search as string | undefined;
  const status = req.query.status as 'all' | 'completed' | 'incomplete' | undefined;

  const tasks = await getFilteredTasks(userId, search, status);

  res.status(200).json({
    status: 200,
    message: 'Successfully retrieved all tasks',
    data: tasks,
  });
};

export const deleteTaskCtrl: Controller = async (req, res) => {
  const userId = verifyUser(req, res);
  if (!userId) {
    return;
  }
  const { id } = req.params;
  const deletedTask = await deleteTaskById(userId, id);
  if (!deletedTask) {
    res.status(404).json({
      status: 404,
      message: 'Task not found',
    });
    return;
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully deleted task',
    data: deletedTask,
  });
};
