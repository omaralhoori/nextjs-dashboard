'use server';

import { auth } from '@/auth';
import type { 
  ItemFile, 
  ItemWithFiles, 
  UploadImageResponse 
} from '@/app/lib/definitions/item-file';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Upload image for an item
export async function uploadItemImageAction(itemId: string, formData: FormData): Promise<{ success: boolean; message: string; data?: UploadImageResponse }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/item-files/upload-image/${itemId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to upload image' };
    }

    const result = await response.json();
    return { success: true, message: result.message, data: result };
  } catch (error) {
    console.error('Error uploading item image:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Get item with files
export async function fetchItemWithFilesAction(itemId: string): Promise<ItemWithFiles | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/items/${itemId}/details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching item with files:', error);
    return { error: 'NETWORK_ERROR' };
  }
}
