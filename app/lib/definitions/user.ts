export interface User {
  id: string;
  userName: string;
  mobileNo: string;
  role: 'admin' | 'warehouse_manager' | 'warehouse_user' | 'pharmacy_manager' | 'pharmacy_user';
  warehouseId: string | null;
  pharmacyId: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  message: string;
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface UsersFilters {
  role?: string;
  enabled?: boolean;
  search?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}
