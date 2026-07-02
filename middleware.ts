import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Edge middleware uses the same auth config (without Credentials provider).
// trustHost must match auth.ts so cookies/sessions work behind nginx + NPM.
const { auth } = NextAuth({
  ...authConfig,
  providers: [],
});

export default auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
