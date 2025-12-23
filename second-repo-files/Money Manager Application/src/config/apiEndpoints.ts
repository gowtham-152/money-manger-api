/**
 * API Endpoints Configuration
 * Base URL and all endpoint paths
 */

export const BASE_URL = "http://localhost:8080/api/v1.0"

/**
 * API Endpoints
 * All available backend endpoints
 */
const API_END_POINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  INCOME: "/incomes",
  EXPENSE: "/expenses",
  CATEGORY: "/categories",
  FILTER: "/filter",
  DASHBOARD: "/dashboard", // Optional: if backend has dedicated dashboard endpoint
}

/**
 * Get full URL for an endpoint
 * @param endpoint - Endpoint path (e.g., API_END_POINTS.LOGIN)
 * @returns Full URL
 * 
 * @example
 * ```typescript
 * const loginUrl = getEndpointUrl(API_END_POINTS.LOGIN);
 * // Returns: "http://localhost:8080/api/v1.0/login"
 * ```
 */
export const getEndpointUrl = (endpoint: string): string => {
  return `${BASE_URL}${endpoint}`;
};

export default API_END_POINTS