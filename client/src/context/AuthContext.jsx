import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../config/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch user details (restore session)
  const restoreSession = async () => {
    const token = localStorage.getItem('nexora_jwt_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      // response is response.data thanks to Axios response interceptor
      if (response?.data) {
        const memberData = response.data.membership || {};
        if (!memberData.organizationId) {
          memberData.organizationId = localStorage.getItem('nexora_org_id') || null;
        } else {
          localStorage.setItem('nexora_org_id', memberData.organizationId);
        }

        if (!memberData.workspaceId) {
          memberData.workspaceId = localStorage.getItem('nexora_workspace_id') || null;
        } else {
          localStorage.setItem('nexora_workspace_id', memberData.workspaceId);
        }

        setUser(response.data.user);
        setMembership(memberData);
        setIsAuthenticated(true);
      }
    } catch {
      // Interceptors handle token clear and redirect events
      localStorage.removeItem('nexora_jwt_token');
      setUser(null);
      setMembership(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform auto login on mount
  useEffect(() => {
    restoreSession();

    // Listen for RTR / Auth failures in interceptor to log out immediately
    const handleUnauthorized = () => {
      localStorage.removeItem('nexora_jwt_token');
      localStorage.removeItem('nexora_org_id');
      localStorage.removeItem('nexora_workspace_id');
      setUser(null);
      setMembership(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener('nexora-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('nexora-unauthorized', handleUnauthorized);
    };
  }, []);

  // 1. Login User
  const login = async (email, password, organizationId) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        organizationId,
      });

      if (response?.data) {
        const { user: userData, membership: memberData, accessToken } = response.data;
        localStorage.setItem('nexora_jwt_token', accessToken);
        // Persist org context so session can be restored across page reloads
        if (memberData?.organizationId) {
          localStorage.setItem('nexora_org_id', memberData.organizationId);
        }
        // Persist workspaceId for session restore
        if (memberData?.workspaceId) {
          localStorage.setItem('nexora_workspace_id', memberData.workspaceId);
        }
        setUser(userData);
        setMembership(memberData);
        setIsAuthenticated(true);
        return response.data;
      }
      throw new Error('Malformed server response.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Register User
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', userData);

      if (response?.data) {
        const { user: userDetails, membership: memberDetails, accessToken } = response.data;
        localStorage.setItem('nexora_jwt_token', accessToken);
        // Persist org context for session restore and future logins
        if (memberDetails?.organizationId) {
          localStorage.setItem('nexora_org_id', memberDetails.organizationId);
        }
        // Persist workspaceId for session restore
        if (memberDetails?.workspaceId) {
          localStorage.setItem('nexora_workspace_id', memberDetails.workspaceId);
        }
        setUser(userDetails);
        setMembership(memberDetails);
        setIsAuthenticated(true);
        return response.data;
      }
      throw new Error('Malformed server response.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Logout User
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Invalidate frontend state even if backend logout fails
    } finally {
      localStorage.removeItem('nexora_jwt_token');
      localStorage.removeItem('nexora_org_id');
      localStorage.removeItem('nexora_workspace_id');
      setUser(null);
      setMembership(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // 4. Forgot Password
  const forgotPassword = async (email, organizationId) => {
    return apiClient.post('/auth/forgot-password', { email, organizationId });
  };

  // 5. Reset Password
  const resetPassword = async (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  };

  // 6. Verify Email
  const verifyEmail = async (token) => {
    return apiClient.post('/auth/verify-email', { token });
  };

  // 7. Change Password
  const changePassword = async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    // Invalidate sessions on password change
    localStorage.removeItem('nexora_jwt_token');
    setUser(null);
    setMembership(null);
    setIsAuthenticated(false);
    return response;
  };

  // 8. Update Profile
  const updateProfile = async (profileData) => {
    const response = await apiClient.patch('/auth/profile', profileData);
    if (response?.data?.user) {
      setUser((prev) => ({ ...prev, ...response.data.user }));
    }
    return response;
  };

  const value = {
    user,
    membership,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
    updateProfile,
    restoreSession,
    setMembership,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
