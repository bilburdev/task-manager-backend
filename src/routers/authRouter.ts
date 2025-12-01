import { Router } from 'express';
import {
  getGoogleOAuthUrlController,
  googleAuthCtrl,
  loginCtrl,
  logoutCtrl,
  signupCtrl,
} from '../contollers/authController';

const authRouter = Router();

authRouter.post('/login', loginCtrl);
authRouter.post('/signup', signupCtrl);
authRouter.delete('/logout', logoutCtrl);

authRouter.get('/google/url', getGoogleOAuthUrlController);
authRouter.post('/google/confirm', googleAuthCtrl);

export default authRouter;
