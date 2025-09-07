// ============================================================================
// ITEM GROUP TYPE DEFINITIONS
// ============================================================================

export interface ItemGroup {
  id: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemGroupStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ItemGroupsResponse {
  message: string;
  itemGroups: ItemGroup[];
  total: number;
}

export interface ItemGroupStatsResponse {
  message: string;
  stats: ItemGroupStats;
}

export interface CreateItemGroupRequest {
  name: string;
  description: string;
  active: boolean;
}

export interface UpdateItemGroupRequest {
  name?: string;
  description?: string;
  active?: boolean;
}
