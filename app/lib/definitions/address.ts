export interface State {
  id: string;
  name: string;
  citiesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CitySummary {
  id: string;
  name: string;
  districtsCount: number;
}

export interface StateDetails extends Omit<State, 'citiesCount'> {
  cities: CitySummary[];
}

export interface City {
  id: string;
  name: string;
  stateId: string;
  stateName?: string;
  districtsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CityDetails extends Omit<City, 'districtsCount'> {
  districts: { id: string; name: string }[];
}

export interface StatesResponse {
  message: string;
  states: State[];
  total: number;
}

export interface StateResponse {
  message: string;
  state: StateDetails;
}

export interface CreateStateRequest {
  name: string;
}

export interface UpdateStateRequest {
  name: string;
}

export interface CitiesResponse {
  message: string;
  cities: City[];
  total: number;
}

export interface CityResponse {
  message: string;
  city: CityDetails;
}

export interface CreateCityRequest {
  name: string;
  stateId: string;
}

export interface UpdateCityRequest {
  name: string;
  stateId: string;
}

export interface District {
  id: string;
  name: string;
  cityId: string;
  cityName?: string;
  stateId?: string;
  stateName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistrictsResponse {
  message: string;
  districts: District[];
  total: number;
}

export interface DistrictResponse {
  message: string;
  district: District;
}

export interface CreateDistrictRequest {
  name: string;
  cityId: string;
}

export interface UpdateDistrictRequest {
  name: string;
  cityId: string;
}
