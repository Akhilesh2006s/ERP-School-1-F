import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')),
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Note: API interceptors are handled centrally
  useEffect(() => {
    // Note: Interceptors are now handled in the centralized api instance
    // No need for local interceptors here
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
    }
  }, [state.token]);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.firstName}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Load user function
  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

      const response = await api.get('/api/auth/me');
      const user = response.data.data.user;

      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: user,
      });
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Failed to load user',
      });
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedSchool');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      const updatedUser = response.data.data.user;

      updateUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    loadUser,
    updateUser,
    clearError,
    changePassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;