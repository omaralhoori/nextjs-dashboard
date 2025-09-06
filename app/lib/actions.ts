'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

// Types for pharmacy files
export interface PharmacyFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
}

export interface PharmacyFilesResponse {
  message: string;
  pharmacy: {
    id: string;
    pharmacyName: string;
    status: string;
    hasUploadedDocuments: boolean;
    documentUploadDate: string | null;
  };
  files: PharmacyFile[];
  stats: {
    totalFiles: number;
    uploadedTypes: string[];
    missingTypes: string[];
    hasAllRequiredFiles: boolean;
  };
  totalFiles: number;
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
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

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };
   

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than 0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }
      const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {
        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
          };
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    const amountInCents = amount * 100;
   
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }

  export async function approvePharmacy(pharmacyId: string) {
    try {
      const session = await auth();
      if (!session?.user?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve pharmacy: ${response.statusText}`);
      }

      revalidatePath('/dashboard');
      return { success: true, message: 'Pharmacy approved successfully' };
    } catch (error) {
      console.error('Error approving pharmacy:', error);
      return { success: false, message: 'Failed to approve pharmacy' };
    }
  }

  export async function rejectPharmacy(pharmacyId: string, reason?: string) {
    try {
      const session = await auth();
      if (!session?.user?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reject pharmacy: ${response.statusText}`);
      }

      revalidatePath('/dashboard');
      return { success: true, message: 'Pharmacy rejected successfully' };
    } catch (error) {
      console.error('Error rejecting pharmacy:', error);
      return { success: false, message: 'Failed to reject pharmacy' };
    }
  }

  export async function fetchPharmacyFilesAction(pharmacyId: string) {
    try {
      const session = await auth();
      if (!session?.user?.accessToken) {
        return { error: 'UNAUTHORIZED' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacy-files/pharmacy/${pharmacyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }

      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }

      if (!response.ok) {
        return { error: 'NETWORK_ERROR' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'NETWORK_ERROR' };
    }
  }

  export async function downloadPharmacyFileAction(fileId: string) {
    try {
      const session = await auth();
      if (!session?.user?.accessToken) {
        return { error: 'UNAUTHORIZED' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacy-files/download/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }

      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }

      if (!response.ok) {
        return { error: 'NETWORK_ERROR' };
      }

      const blob = await response.blob();
      return { success: true, blob };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'NETWORK_ERROR' };
    }
  }