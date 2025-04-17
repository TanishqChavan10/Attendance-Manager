import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkAuthentication, getTokenInfo } from '../../utils/authChecker';

const AuthDebugger = () => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const [authCheck, setAuthCheck] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  
  useEffect(() => {
    setTokenInfo(getTokenInfo());
  }, []);
  
  const runAuthCheck = async () => {
    setCheckLoading(true);
    try {
      const result = await checkAuthentication();
      setAuthCheck(result);
    } catch (err) {
      setAuthCheck({
        error: err.message,
        status: 'error'
      });
    } finally {
      setCheckLoading(false);
    }
  };
  
  return (
    <div className="auth-debugger" style={{
      padding: '20px',
      margin: '20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>Authentication Debugger</h2>
      
      <h3>Context State</h3>
      <div>
        <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
        <p><strong>Loading:</strong> {String(loading)}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
      </div>
      
      <h3>Token Information</h3>
      {tokenInfo ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(tokenInfo, null, 2)}
        </pre>
      ) : (
        <p>No token found in localStorage</p>
      )}
      
      <h3>Authentication Check</h3>
      <button 
        onClick={runAuthCheck}
        disabled={checkLoading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        {checkLoading ? 'Checking...' : 'Check Authentication'}
      </button>
      
      {authCheck && (
        <div>
          <p><strong>Status:</strong> {authCheck.status}</p>
          <p><strong>Message:</strong> {authCheck.message}</p>
          {authCheck.user && (
            <div>
              <p><strong>User Data:</strong></p>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(authCheck.user, null, 2)}
              </pre>
            </div>
          )}
          {authCheck.error && (
            <div>
              <p><strong>Error:</strong></p>
              <pre style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
                {JSON.stringify(authCheck.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Quick Actions</h3>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Clear Token & Reload
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger; 