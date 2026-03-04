import { FilterQuery } from 'mongoose';
import { TaskDB } from '../db/models/taskSchema';
import { UserDB } from '../db/models/userSchema';
import { AddTask, UpdateTask } from '../validation/task';

export const addTask = async (userId: string, data: AddTask) => {
  const user = await UserDB.findById(userId);
  if (!user) {
    return;
  }

  const { title, description, dueDate, priority, isCompleted, tags, subtasks } = data;

  const createdTask = await TaskDB.create({
    title,
    description,
    dueDate,
    priority,
    isCompleted,
    tags,
    subtasks,
    userId,
  });
  const task = await TaskDB.findById(createdTask._id).select('-createdAt -updatedAt -userId');
  return task;
};

export const updateTaskById = async (userId: string, id: string, data: UpdateTask) => {
  const user = await UserDB.findById(userId);
  if (!user) {
    return;
  }

  const { title, description, dueDate, priority, isCompleted, tags, subtasks } = data;
  if (!TaskDB.find({ userId, _id: id })) {
    return;
  }

  return await TaskDB.findOneAndUpdate(
    { _id: id, userId },
    {
      title,
      description,
      dueDate,
      priority,
      isCompleted,
      tags,
      subtasks,
      userId,
    },
    { new: true, runValidators: true }
  ).select('-createdAt -updatedAt -userId');
};

export const getTaskById = async (userId: string, id: string) => {
  const user = await UserDB.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const task = await TaskDB.findOne({ _id: id, userId }).select('-createdAt -updatedAt -userId');
  if (!task) {
    return;
  }
  return task;
};

export const getAllTasks = async (userId: string) => {
  const user = await UserDB.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const tasks = await TaskDB.find({ userId }).select('-createdAt -updatedAt -userId');
  return tasks;
};

export const deleteTaskById = async (userId: string, id: string) => {
  const user = await UserDB.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return await TaskDB.findByIdAndDelete({ _id: id, userId });
};

export interface ITask {
  userId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  isCompleted: boolean;
}

export const getFilteredTasks = async (
  userId: string,
  search?: string,
  status?: string
): Promise<ITask[]> => {
  const query: FilterQuery<ITask> = { userId };
  if (status === 'completed') {
    query.isCompleted = true;
  } else if (status === 'incomplete') {
    query.isCompleted = false;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
      { priority: { $regex: search, $options: 'i' } },
    ];
  }

  return TaskDB.find(query);
};
