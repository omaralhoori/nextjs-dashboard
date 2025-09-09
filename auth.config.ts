import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && !isOnLogin) {
        // Only redirect if not already on login page to avoid redirect loops
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.warehouseId = user.warehouseId;
        token.pharmacyId = user.pharmacyId;
        token.enabled = user.enabled;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.role = token.role as string;
        session.user.warehouseId = token.warehouseId as string | null;
        session.user.pharmacyId = token.pharmacyId as string | null;
        session.user.enabled = token.enabled as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;