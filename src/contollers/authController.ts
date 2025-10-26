import { Request, Response } from 'express';
import { googleAuth, loginUser, signupUser } from '../services/authService';
import { Controller } from '../utils/controllerWr';
import { createToken } from '../utils/jwt';
import { setupCookies } from '../utils/cookies';
import { generateAuthUrl } from '../utils/verifyGoogleToken';

export const loginCtrl: Controller = async (req, res) => {
  const { user } = await loginUser(req.body);
  const token = createToken(user._id as string);
  setupCookies(res, token);
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in',
    data: user,
  });
};

export const signupCtrl: Controller = async (req, res) => {
  const { user } = await signupUser(req.body);
  const token = createToken(user._id as string);
  setupCookies(res, token);
  res.status(201).json({
    status: 201,
    message: 'Successfully signed up',
    data: user,
  });
};

export const logoutCtrl = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(204).json({
    status: 204,
    message: 'Logged out',
  });
};

export const getGoogleOAuthUrlController = async (_req: Request, res: Response) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const googleAuthCtrl: Controller = async (req, res) => {
  const user = await googleAuth(req.body.code);
  const token = createToken(user._id as string);
  setupCookies(res, token);
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in',
    data: user,
  });
};
