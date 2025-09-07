// ============================================================================
// ADDRESS TYPE DEFINITIONS
// ============================================================================

export interface AddressState {
  id: string;
  name: string;
  citiesCount: number;
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  stateName: string;
  districtsCount: number;
}

export interface District {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  stateId: string;
  stateName: string;
}

export interface StatesResponse {
  message: string;
  states: AddressState[];
  total: number;
}

export interface CitiesResponse {
  message: string;
  cities: City[];
  total: number;
}

export interface DistrictsResponse {
  message: string;
  districts: District[];
  total: number;
}
