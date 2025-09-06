import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Types for NestJS API response
interface NestJSUser {
  id: string;
  userName: string;
  mobileNo: string;
  role: string;
  warehouseId: string | null;
  pharmacyId: string | null;
  enabled: boolean;
}

interface NestJSAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: NestJSUser;
}

async function authenticateWithNestJS(mobileNo: string, password: string): Promise<NestJSAuthResponse | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNo,
        password,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: NestJSAuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to authenticate with NestJS:', error);
    return null;
  }
}
 
  
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [ 
    Credentials({
        async authorize(credentials) {
          const parsedCredentials = z
            .object({ mobileNo: z.string().min(1), password: z.string().min(6) })
            .safeParse(credentials);
   
          if (parsedCredentials.success) {
            const { mobileNo, password } = parsedCredentials.data;
            
            const authResponse = await authenticateWithNestJS(mobileNo, password);
            if (!authResponse) return null;
            
            // Return user object compatible with NextAuth
            return {
              id: authResponse.user.id,
              name: authResponse.user.userName,
              email: authResponse.user.mobileNo, // Using mobileNo as email for compatibility
              role: authResponse.user.role,
              warehouseId: authResponse.user.warehouseId,
              pharmacyId: authResponse.user.pharmacyId,
              enabled: authResponse.user.enabled,
              accessToken: authResponse.accessToken,
              refreshToken: authResponse.refreshToken,
            };
          }
          console.log('Invalid credentials');
          return null;
        },
      }),
  ],
});