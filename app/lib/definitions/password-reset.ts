export interface PasswordResetUser {
  id: string;
  userName: string;
  mobileNo: string;
  role: string;
}

export interface PasswordResetRequest {
  id: string;
  mobileNo: string;
  status: 'pending' | 'resolved' | 'rejected';
  adminNotes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: PasswordResetUser;
}

export interface PasswordResetPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PasswordResetRequestsResponse {
  message: string;
  requests: PasswordResetRequest[];
  pagination: PasswordResetPagination;
}
