'use server';

// ============================================================================
// ADDRESS MANAGEMENT FUNCTIONS
// ============================================================================

import type {
  StatesResponse,
  CitiesResponse,
  DistrictsResponse,
} from '@/app/lib/definitions/address';

export async function fetchStatesAction(): Promise<StatesResponse | { error: 'NETWORK_ERROR' }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return { error: 'NETWORK_ERROR' };
    }

    const response = await fetch(`${apiUrl}/public/address/states`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: 'NETWORK_ERROR' };
    }

    const data: StatesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchCitiesAction(stateId: string): Promise<CitiesResponse | { error: 'NETWORK_ERROR' }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return { error: 'NETWORK_ERROR' };
    }

    const response = await fetch(`${apiUrl}/public/address/cities?stateId=${stateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: 'NETWORK_ERROR' };
    }

    const data: CitiesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchDistrictsAction(cityId: string): Promise<DistrictsResponse | { error: 'NETWORK_ERROR' }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return { error: 'NETWORK_ERROR' };
    }

    const response = await fetch(`${apiUrl}/public/address/districts?cityId=${cityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { error: 'NETWORK_ERROR' };
    }

    const data: DistrictsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'NETWORK_ERROR' };
  }
}
