'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const countryCode = (formData.get('countryCode') as string) || '+963';
    const localNumber = (formData.get('localNumber') as string) || '';
    const password = formData.get('password') as string;
    const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

    const mobileNo = `${countryCode}${localNumber}`;

    await signIn('credentials', { mobileNo, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
