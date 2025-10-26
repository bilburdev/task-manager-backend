import { OAuth2Client } from 'google-auth-library';
import { env } from './env';

const googleOAuthClient = new OAuth2Client({
  clientId: env('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: env('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: env('GOOGLE_AUTH_REDIRECT_URI'),
});

export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const validateCode = async (code: string) => {
  const response = await googleOAuthClient.getToken(code);
  if (!response.tokens.id_token) throw new Error('Unauthorized');

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
    audience: env('GOOGLE_AUTH_CLIENT_ID'),
  });
  return ticket;
};

export interface GoogleTokenPayload {
  given_name?: string;
  family_name?: string;
  [key: string]: unknown;
}

export const getFullNameFromGoogleTokenPayload = (payload: GoogleTokenPayload): string => {
  let fullName = 'Guest';
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }
  return fullName;
};
