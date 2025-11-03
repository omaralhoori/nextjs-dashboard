'use server';

import { auth } from '@/auth';
import type {
  State,
  StateDetails,
  StatesResponse,
  StateResponse,
  CreateStateRequest,
  UpdateStateRequest,
  City,
  CityDetails,
  CitiesResponse,
  CityResponse,
  CreateCityRequest,
  UpdateCityRequest,
  District,
  DistrictsResponse,
  DistrictResponse,
  CreateDistrictRequest,
  UpdateDistrictRequest,
} from '@/app/lib/definitions/address';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.user?.accessToken) {
    throw new Error('UNAUTHORIZED');
  }
  return {
    'Authorization': `Bearer ${session.user.accessToken}`,
    'Content-Type': 'application/json',
  } as HeadersInit;
}

export async function fetchStatesAction(): Promise<StatesResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/states`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: StatesResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchStatesAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchStateDetailsAction(stateId: string): Promise<StateResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/states/${stateId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: StateResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchStateDetailsAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createStateAction(payload: CreateStateRequest): Promise<{ success: boolean; message: string; state?: State }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/states`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to create state' };
    }
    return { success: true, message: data?.message || 'State created successfully', state: data?.state };
  } catch (err) {
    console.error('createStateAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function updateStateAction(stateId: string, payload: UpdateStateRequest): Promise<{ success: boolean; message: string; state?: State }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/states/${stateId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to update state' };
    }
    return { success: true, message: data?.message || 'State updated successfully', state: data?.state };
  } catch (err) {
    console.error('updateStateAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function deleteStateAction(stateId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/states/${stateId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to delete state' };
    }
    return { success: true, message: data?.message || 'State deleted successfully' };
  } catch (err) {
    console.error('deleteStateAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// ===================== Cities =====================
export async function fetchCitiesAction(params: { stateId?: string }): Promise<CitiesResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const query = params.stateId ? `?stateId=${encodeURIComponent(params.stateId)}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/address/cities${query}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: CitiesResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchCitiesAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchCityDetailsAction(cityId: string): Promise<CityResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/cities/${cityId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: CityResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchCityDetailsAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createCityAction(payload: CreateCityRequest): Promise<{ success: boolean; message: string; city?: City }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/cities`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to create city' };
    }
    return { success: true, message: data?.message || 'City created successfully', city: data?.city };
  } catch (err) {
    console.error('createCityAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function updateCityAction(cityId: string, payload: UpdateCityRequest): Promise<{ success: boolean; message: string; city?: City }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/cities/${cityId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to update city' };
    }
    return { success: true, message: data?.message || 'City updated successfully', city: data?.city };
  } catch (err) {
    console.error('updateCityAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function deleteCityAction(cityId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/cities/${cityId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to delete city' };
    }
    return { success: true, message: data?.message || 'City deleted successfully' };
  } catch (err) {
    console.error('deleteCityAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// ===================== Districts =====================
export async function fetchDistrictsAction(params: { cityId?: string }): Promise<DistrictsResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const query = params.cityId ? `?cityId=${encodeURIComponent(params.cityId)}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/address/districts${query}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: DistrictsResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchDistrictsAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchDistrictDetailsAction(districtId: string): Promise<DistrictResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/districts/${districtId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return { error: 'UNAUTHORIZED' };
      if (res.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP ${res.status}`);
    }
    const data: DistrictResponse = await res.json();
    return data;
  } catch (err) {
    console.error('fetchDistrictDetailsAction error:', err);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createDistrictAction(payload: CreateDistrictRequest): Promise<{ success: boolean; message: string; district?: District }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/districts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to create district' };
    }
    return { success: true, message: data?.message || 'District created successfully', district: data?.district };
  } catch (err) {
    console.error('createDistrictAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function updateDistrictAction(districtId: string, payload: UpdateDistrictRequest): Promise<{ success: boolean; message: string; district?: District }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/districts/${districtId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to update district' };
    }
    return { success: true, message: data?.message || 'District updated successfully', district: data?.district };
  } catch (err) {
    console.error('updateDistrictAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function deleteDistrictAction(districtId: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/address/districts/${districtId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, message: data?.message || 'Failed to delete district' };
    }
    return { success: true, message: data?.message || 'District deleted successfully' };
  } catch (err) {
    console.error('deleteDistrictAction error:', err);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}