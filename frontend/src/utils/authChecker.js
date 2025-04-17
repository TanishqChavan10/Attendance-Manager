import { getCurrentUser } from '../api/auth';

/**
 * Utility function to test if authentication is working correctly
 * @returns {Promise<Object>} Result of authentication check
 */
export const checkAuthentication = async () => {
  try {
    // Check if a token exists
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        isAuthenticated: false,
        message: 'No token found in localStorage',
        status: 'no_token'
      };
    }

    // Try to get the current user with the token
    const userData = await getCurrentUser();
    
    return {
      isAuthenticated: true,
      user: userData,
      message: 'Authentication successful',
      status: 'success'
    };
  } catch (error) {
    // Check if the error is due to an expired/invalid token (401)
    if (error.response && error.response.status === 401) {
      return {
        isAuthenticated: false,
        message: 'Authentication failed: Token invalid or expired',
        status: 'invalid_token',
        error
      };
    }
    
    // Other errors
    return {
      isAuthenticated: false,
      message: `Authentication check failed: ${error.message || 'Unknown error'}`,
      status: 'error',
      error
    };
  }
};

/**
 * Gets information about the stored JWT token
 * @returns {Object} Token information or null
 */
export const getTokenInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // Split the token and decode the payload
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    
    // Calculate expiration time
    const expiresAt = new Date(decodedPayload.exp * 1000);
    const now = new Date();
    const isExpired = now > expiresAt;
    
    return {
      token: token.substring(0, 15) + '...',  // Only show beginning of token for security
      userId: decodedPayload.id,
      username: decodedPayload.username,
      issuedAt: new Date(decodedPayload.iat * 1000),
      expiresAt,
      isExpired,
      timeRemaining: isExpired ? 'Expired' : `${Math.floor((expiresAt - now) / 60000)} minutes`,
    };
  } catch (error) {
    return {
      error: 'Invalid token format',
      token: token.substring(0, 15) + '...'
    };
  }
}; 