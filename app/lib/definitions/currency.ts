export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate?: number | null;
  active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrenciesResponse {
  message: string;
  currencies: Currency[];
  total: number;
}

export interface CurrencyStats {
  total: number;
  active: number;
  inactive: number;
  default_currency: string | null;
}

export interface CurrencyStatsResponse {
  message: string;
  stats: CurrencyStats;
}

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  is_default?: boolean;
}

export interface UpdateCurrencyRequest {
  code?: string;
  name?: string;
  symbol?: string;
  exchange_rate?: number;
  active?: boolean;
  is_default?: boolean;
}
