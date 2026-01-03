import { CookieOptions } from 'express';

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    } as CookieOptions,
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    } as CookieOptions,
  },
};
