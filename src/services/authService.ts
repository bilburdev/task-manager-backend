import createHttpError from 'http-errors';
import { UserDB } from '../db/models/userSchema';
import {
  getFullNameFromGoogleTokenPayload,
  GoogleTokenPayload,
  validateCode,
} from '../utils/verifyGoogleToken';
import bcrypt from 'bcrypt';

export const signupUser = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;
  try {
    const user = await UserDB.create({ name, email, password });
    return { user };
  } catch {
    throw createHttpError(409, 'User with this email already exists');
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const user = await UserDB.findOne({ email });
  if (!user) throw createHttpError(404, 'User with this email not found');

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw createHttpError(401, 'Invalid password');

  return { user };
};

export const googleAuth = async (code: string) => {
  const ticket = await validateCode(code);
  const rawPayload = ticket.getPayload();
  if (!rawPayload || !rawPayload.email) {
    throw new Error('Unauthorized');
  }
  const payload = rawPayload as unknown as GoogleTokenPayload;
  let user = await UserDB.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
    user = await UserDB.create({
      name: getFullNameFromGoogleTokenPayload(payload),
      email: payload.email,
      password,
    });
  }
  return user;
};
