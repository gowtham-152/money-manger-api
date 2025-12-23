/**
 * Token Manager Utility
 * Centralized token management - token should ONLY be set during login/register
 * Token is used as Bearer token for ALL API calls across all pages
 */

/**
 * Get the current authentication token
 * @returns Token string or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated (has valid token)
 * @returns true if token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Set token - SHOULD ONLY BE CALLED DURING LOGIN/REGISTER
 * This is a protected function to ensure token is only set at login time
 * @param token - JWT token from backend
 * @param user - User object
 */
export const setAuthToken = (token: string, user: any): void => {
  console.log('🔐 Setting authentication token (login/register only)');
  console.log('Token:', token.substring(0, 20) + '...');
  
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('backendMode', 'online');
  
  console.log('✅ Token stored successfully');
};

/**
 * Clear token - Called during logout
 */
export const clearAuthToken = (): void => {
  console.log('🔓 Clearing authentication token');
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('backendMode');
  console.log('✅ Token cleared');
};

/**
 * Verify token is being used correctly
 * Checks if token exists and is being sent with API requests
 */
export const verifyTokenUsage = (): {
  tokenExists: boolean;
  tokenValue: string | null;
  tokenLength: number;
  bearerFormat: boolean;
} => {
  const token = getToken();
  const tokenExists = !!token;
  const tokenLength = token?.length || 0;
  
  // Check if token is in correct format (usually JWT tokens are long)
  const bearerFormat = tokenExists && tokenLength > 20;
  
  return {
    tokenExists,
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    tokenLength,
    bearerFormat,
  };
};

/**
 * Log token status for debugging
 */
export const logTokenStatus = (): void => {
  const status = verifyTokenUsage();
  console.log('=== Token Status ===');
  console.log('Token exists:', status.tokenExists ? '✅' : '❌');
  console.log('Token preview:', status.tokenValue || 'N/A');
  console.log('Token length:', status.tokenLength);
  console.log('Bearer format valid:', status.bearerFormat ? '✅' : '❌');
  
  if (!status.tokenExists) {
    console.warn('⚠️ No token found. Please login.');
  } else if (!status.bearerFormat) {
    console.warn('⚠️ Token format may be invalid.');
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).checkToken = logTokenStatus;
  (window as any).getToken = getToken;
}
