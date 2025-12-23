import axiosConfig from '../config/axiosConfig';
import API_END_POINTS from '../config/apiEndpoints';
import { Transaction, Category } from '../App';

/**
 * API Service for all backend communications
 * All data operations go through the backend database
 * Falls back to localStorage when backend is unavailable
 */

// Helper function to check if in offline mode
// IMPORTANT: Only use offline mode if explicitly set or backend is truly unavailable
const isOfflineMode = () => {
  const mode = localStorage.getItem('backendMode');
  // Only return true if explicitly set to offline
  // Don't auto-switch to offline on errors - let errors propagate
  return mode === 'offline';
};

// Helper to force online mode (use backend database)
export const forceOnlineMode = () => {
  localStorage.setItem('backendMode', 'online');
  console.log('🌐 Forced online mode - all data will be stored in database');
};

// Helper to check backend availability
export const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Try a simple authenticated request
    const response = await axiosConfig.get(API_END_POINTS.INCOME, { timeout: 5000 });
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    // Only network errors mean backend is unavailable
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return false;
    }
    // Other errors (401, 403, etc.) mean backend IS available but request failed
    return true;
  }
};

// Helper function to get user ID from token or localStorage
const getUserId = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    return JSON.parse(user).id || JSON.parse(user).email;
  }
  return 'offline_user';
};

// ==================== Auth Services ====================

export const loginUser = async (email: string, password: string) => {
  try {
    console.log('🔄 Attempting API login...');
    console.log('📤 Request URL:', `${axiosConfig.defaults.baseURL}${API_END_POINTS.LOGIN}`);
    console.log('📤 Request body:', { email, password: '***' });
    
    const response = await axiosConfig.post(API_END_POINTS.LOGIN, { email, password });
    
    console.log('✅ API login successful!');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error during login:', error);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      throw new Error(error.response.data?.message || error.response.data?.error || 'Login failed');
    }
    throw error;
  }
};

export const registerUser = async (username: string, email: string, password: string) => {
  try {
    console.log('🔄 Attempting API registration...');
    console.log('📤 Request URL:', `${axiosConfig.defaults.baseURL}${API_END_POINTS.REGISTER}`);
    console.log('📤 Request body:', { username, email, password: '***' });
    
    const response = await axiosConfig.post(API_END_POINTS.REGISTER, { username, email, password });
    
    console.log('✅ API registration successful!');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error during registration:', error);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      throw new Error(error.response.data?.message || error.response.data?.error || 'Registration failed');
    }
    throw error;
  }
};

// ==================== Income Services ====================

export const fetchIncomes = async () => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Loading incomes from localStorage');
    const userId = getUserId();
    const incomes = JSON.parse(localStorage.getItem(`incomes_${userId}`) || '[]');
    return incomes;
  }

  try {
    const response = await axiosConfig.get(API_END_POINTS.INCOME);
    // Handle different response formats
    const data = response.data.incomes || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      const userId = getUserId();
      const incomes = JSON.parse(localStorage.getItem(`incomes_${userId}`) || '[]');
      return incomes;
    }
    throw error;
  }
};

export const createIncome = async (income: {
  name?: string;
  categoryId: number;
  amount: number;
  date: string;
  description?: string;
}) => {
  // Validate required fields
  if (!income.categoryId || income.amount <= 0 || !income.date) {
    const missingFields = [];
    if (!income.categoryId) missingFields.push('category');
    if (!income.amount || income.amount <= 0) missingFields.push('amount');
    if (!income.date) missingFields.push('date');
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // ONLY use offline mode if explicitly set
  // Don't auto-fallback - ensure data goes to database when backend is available
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Saving income to localStorage');
    const userId = getUserId();
    const incomes = JSON.parse(localStorage.getItem(`incomes_${userId}`) || '[]');
    const newIncome = {
      id: 'inc_' + Date.now(),
      ...income,
    };
    incomes.push(newIncome);
    localStorage.setItem(`incomes_${userId}`, JSON.stringify(incomes));
    return newIncome;
  }

  // ALWAYS try backend first - data should be stored in database
  try {
    console.log('🌐 Online mode: Saving income to backend database');
    console.log('📤 Sending income to backend:', income);
    console.log('📤 Request URL:', `${axiosConfig.defaults.baseURL}${API_END_POINTS.INCOME}`);
    console.log('📤 Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token') ? 'Bearer ***' : 'Not set'
    });
    
    const response = await axiosConfig.post(API_END_POINTS.INCOME, income);
    
    console.log('✅ Income saved to database successfully!');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    
    // Ensure name field is preserved from request if backend doesn't return it
    return {
      ...response.data,
      name: response.data.name || income.name,
    };
  } catch (error: any) {
    console.error('❌ Error saving income to database:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Only fallback to offline if it's a TRUE network error (backend not reachable)
    // Don't fallback on 403/401/500 - these mean backend IS available but request failed
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('⚠️ Backend not reachable - network error detected');
      console.warn('⚠️ Falling back to localStorage (offline mode)');
      localStorage.setItem('backendMode', 'offline');
      // Retry in offline mode
      const userId = getUserId();
      const incomes = JSON.parse(localStorage.getItem(`incomes_${userId}`) || '[]');
      const newIncome = {
        id: 'inc_' + Date.now(),
        ...income,
      };
      incomes.push(newIncome);
      localStorage.setItem(`incomes_${userId}`, JSON.stringify(incomes));
      return newIncome;
    }
    
    // Handle different error types - DON'T fallback, throw error so user knows
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('Backend error response:', {
        status,
        statusText: error.response.statusText,
        data: errorData
      });
      
      // Provide specific error messages based on status code
      let errorMessage = 'Failed to save income to database';
      
      if (status === 400) {
        errorMessage = errorData?.message || errorData?.error || 'Invalid data. Please check all fields.';
      } else if (status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (status === 403) {
        // Provide more helpful message for 403 errors
        const token = localStorage.getItem('token');
        if (!token) {
          errorMessage = 'Access denied. No authentication token found. Please login again.';
        } else {
          errorMessage = 'Access denied. Backend is available but request was blocked. ' +
            'This is usually a CORS or backend security configuration issue. ' +
            'Please check: 1) Backend CORS allows your frontend origin (' + window.location.origin + '), ' +
            '2) Token is valid, 3) Backend security configuration. ' +
            'Check browser console and backend logs for details.';
        }
      } else if (status === 404) {
        errorMessage = 'Endpoint not found. Please check backend configuration.';
      } else if (status === 422) {
        errorMessage = errorData?.message || errorData?.error || 'Validation error. Please check your input.';
      } else if (status === 500) {
        errorMessage = 'Server error. Backend is available but encountered an error. Please try again later.';
      } else {
        errorMessage = errorData?.message || errorData?.error || `Server error (${status}). Please try again.`;
      }
      
      // Include validation errors if available
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.map((e: any) => e.message || e).join(', ');
        errorMessage += ` Validation errors: ${validationErrors}`;
      }
      
      throw new Error(errorMessage);
    }
    
    throw new Error(error.message || 'Failed to save income to database. Please try again.');
  }
};

export const updateIncome = async (id: string, income: Partial<Transaction>) => {
  const response = await axiosConfig.put(`${API_END_POINTS.INCOME}/${id}`, income);
  return response.data;
};

export const deleteIncome = async (id: string) => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Deleting income from localStorage');
    const userId = getUserId();
    const incomes = JSON.parse(localStorage.getItem(`incomes_${userId}`) || '[]');
    const filtered = incomes.filter((inc: any) => inc.id !== id);
    localStorage.setItem(`incomes_${userId}`, JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const response = await axiosConfig.delete(`${API_END_POINTS.INCOME}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      return deleteIncome(id); // Retry in offline mode
    }
    throw error;
  }
};

// ==================== Expense Services ====================

export const fetchExpenses = async () => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Loading expenses from localStorage');
    const userId = getUserId();
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    return expenses;
  }

  try {
    const response = await axiosConfig.get(API_END_POINTS.EXPENSE);
    // Handle different response formats
    const data = response.data.expenses || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      const userId = getUserId();
      const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
      return expenses;
    }
    throw error;
  }
};

export const createExpense = async (expense: {
  name?: string;
  categoryId: number;
  amount: number;
  date: string;
  description?: string;
}) => {
  // Validate required fields
  if (!expense.categoryId || expense.amount <= 0 || !expense.date) {
    const missingFields = [];
    if (!expense.categoryId) missingFields.push('category');
    if (!expense.amount || expense.amount <= 0) missingFields.push('amount');
    if (!expense.date) missingFields.push('date');
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // ONLY use offline mode if explicitly set
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Saving expense to localStorage');
    const userId = getUserId();
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    const newExpense = {
      id: 'exp_' + Date.now(),
      ...expense,
    };
    expenses.push(newExpense);
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses));
    return newExpense;
  }

  // ALWAYS try backend first - data should be stored in database
  try {
    console.log('🌐 Online mode: Saving expense to backend database');
    console.log('📤 Sending expense to backend:', expense);
    const response = await axiosConfig.post(API_END_POINTS.EXPENSE, expense);
    console.log('✅ Expense saved to database successfully:', response.data);
    // Ensure name field is preserved from request if backend doesn't return it
    return {
      ...response.data,
      name: response.data.name || expense.name,
    };
  } catch (error: any) {
    console.error('❌ Error saving expense to database:', error);
    // Only fallback on TRUE network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('⚠️ Backend not reachable - falling back to localStorage');
      localStorage.setItem('backendMode', 'offline');
      // Retry in offline mode
      const userId = getUserId();
      const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
      const newExpense = {
        id: 'exp_' + Date.now(),
        ...expense,
      };
      expenses.push(newExpense);
      localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses));
      return newExpense;
    }
    // Re-throw with more context - don't auto-fallback
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      const status = error.response.status;
      let errorMessage = 'Failed to save expense to database';
      
      if (status === 403) {
        errorMessage = 'Access denied. Backend is available but request was blocked. ' +
          'Check CORS configuration allows: ' + window.location.origin;
      } else {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Partial<Transaction>) => {
  const response = await axiosConfig.put(`${API_END_POINTS.EXPENSE}/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Deleting expense from localStorage');
    const userId = getUserId();
    const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
    const filtered = expenses.filter((exp: any) => exp.id !== id);
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const response = await axiosConfig.delete(`${API_END_POINTS.EXPENSE}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      return deleteExpense(id); // Retry in offline mode
    }
    throw error;
  }
};

// ==================== Category Services ====================

export const fetchCategories = async () => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Loading categories from localStorage');
    const userId = getUserId();
    const categories = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    
    // If no categories, return defaults
    if (categories.length === 0) {
      const defaultCategories = [
        { id: '1', name: 'Salary', type: 'income', color: '#10b981' },
        { id: '2', name: 'Freelance', type: 'income', color: '#34d399' },
        { id: '3', name: 'Investment', type: 'income', color: '#6ee7b7' },
        { id: '4', name: 'Food', type: 'expense', color: '#ef4444' },
        { id: '5', name: 'Transport', type: 'expense', color: '#f87171' },
        { id: '6', name: 'Entertainment', type: 'expense', color: '#fca5a5' },
        { id: '7', name: 'Bills', type: 'expense', color: '#dc2626' },
      ];
      localStorage.setItem(`categories_${userId}`, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    
    return categories;
  }

  try {
    const response = await axiosConfig.get(API_END_POINTS.CATEGORY);
    // Handle different response formats
    const data = response.data.categories || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      return fetchCategories(); // Retry in offline mode
    }
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Saving category to localStorage');
    const userId = getUserId();
    const categories = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    const newCategory = {
      id: 'cat_' + Date.now(),
      ...category,
    };
    categories.push(newCategory);
    localStorage.setItem(`categories_${userId}`, JSON.stringify(categories));
    return newCategory;
  }

  try {
    const response = await axiosConfig.post(API_END_POINTS.CATEGORY, category);
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      return createCategory(category); // Retry in offline mode
    }
    throw error;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const response = await axiosConfig.put(`${API_END_POINTS.CATEGORY}/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  if (isOfflineMode()) {
    console.log('📱 Offline mode: Deleting category from localStorage');
    const userId = getUserId();
    const categories = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    const filtered = categories.filter((cat: any) => cat.id !== id);
    localStorage.setItem(`categories_${userId}`, JSON.stringify(filtered));
    return { success: true };
  }

  try {
    const response = await axiosConfig.delete(`${API_END_POINTS.CATEGORY}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('⚠️ Backend unavailable, switching to offline mode');
      localStorage.setItem('backendMode', 'offline');
      return deleteCategory(id); // Retry in offline mode
    }
    throw error;
  }
};

// ==================== Dashboard Services ====================

export const fetchDashboardData = async () => {
  try {
    // Fetch all data for dashboard
    const [incomes, expenses, categories] = await Promise.all([
      fetchIncomes(),
      fetchExpenses(),
      fetchCategories(),
    ]);

    return {
      incomes,
      expenses,
      categories,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// ==================== Filter Services ====================

export const filterTransactions = async (filters: {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}) => {
  try {
    const response = await axiosConfig.post(API_END_POINTS.FILTER, filters);
    // Handle different response formats
    const data = response.data.transactions || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error filtering transactions:', error);
    throw error;
  }
};

// ==================== Utility Functions ====================

export const getAllTransactions = async () => {
  try {
    const [incomes, expenses] = await Promise.all([
      fetchIncomes(),
      fetchExpenses(),
    ]);

    const allTransactions: Transaction[] = [
      ...incomes.map((income: any) => ({ ...income, type: 'income' as const })),
      ...expenses.map((expense: any) => ({ ...expense, type: 'expense' as const })),
    ];

    return allTransactions;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};