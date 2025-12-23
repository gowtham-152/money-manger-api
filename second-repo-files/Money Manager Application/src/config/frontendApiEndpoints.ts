/**
 * Frontend API Endpoints Configuration
 * Complete list of all API endpoints available for frontend use
 * 
 * Base URL: http://localhost:8080/api/v1.0
 * All endpoints automatically include Bearer token (except login/register)
 */

import axiosConfig from './axiosConfig';
import API_END_POINTS from './apiEndpoints';

// ==================== Type Definitions ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Income {
  id?: string;
  name?: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Expense {
  id?: string;
  name?: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Category {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface FilterRequest {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ==================== Authentication Endpoints ====================

/**
 * POST /login
 * User login - No authentication required
 * 
 * @param credentials - Login credentials
 * @returns Auth response with token and user data
 * 
 * @example
 * ```typescript
 * const response = await login({ email: 'user@example.com', password: 'password123' });
 * localStorage.setItem('token', response.token);
 * ```
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosConfig.post(API_END_POINTS.LOGIN, credentials);
  return response.data;
};

/**
 * POST /register
 * User registration - No authentication required
 * 
 * @param userData - Registration data
 * @returns Auth response with token and user data
 * 
 * @example
 * ```typescript
 * const response = await register({ 
 *   username: 'John Doe', 
 *   email: 'john@example.com', 
 *   password: 'password123' 
 * });
 * localStorage.setItem('token', response.token);
 * ```
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosConfig.post(API_END_POINTS.REGISTER, userData);
  return response.data;
};

// ==================== Income Endpoints ====================

/**
 * GET /incomes
 * Get all incomes for authenticated user
 * Requires: Bearer token
 * 
 * @returns Array of income objects
 * 
 * @example
 * ```typescript
 * const incomes = await getIncomes();
 * console.log('Total incomes:', incomes.length);
 * ```
 */
export const getIncomes = async (): Promise<Income[]> => {
  const response = await axiosConfig.get(API_END_POINTS.INCOME);
  return response.data.incomes || response.data.data || response.data;
};

/**
 * POST /incomes
 * Create new income
 * Requires: Bearer token
 * 
 * @param income - Income data
 * @returns Created income object with ID
 * 
 * @example
 * ```typescript
 * const newIncome = await createIncome({
 *   name: 'Salary',
 *   category: 'Salary',
 *   amount: 5000,
 *   date: '2025-12-22',
 *   description: 'Monthly salary'
 * });
 * ```
 */
export const createIncome = async (income: Omit<Income, 'id'>): Promise<Income> => {
  const response = await axiosConfig.post(API_END_POINTS.INCOME, income);
  return response.data;
};

/**
 * PUT /incomes/:id
 * Update existing income
 * Requires: Bearer token
 * 
 * @param id - Income ID
 * @param updates - Partial income data to update
 * @returns Updated income object
 * 
 * @example
 * ```typescript
 * const updated = await updateIncome('inc_123', { amount: 6000 });
 * ```
 */
export const updateIncome = async (id: string, updates: Partial<Income>): Promise<Income> => {
  const response = await axiosConfig.put(`${API_END_POINTS.INCOME}/${id}`, updates);
  return response.data;
};

/**
 * DELETE /incomes/:id
 * Delete income
 * Requires: Bearer token
 * 
 * @param id - Income ID
 * @returns Success response
 * 
 * @example
 * ```typescript
 * await deleteIncome('inc_123');
 * ```
 */
export const deleteIncome = async (id: string): Promise<void> => {
  await axiosConfig.delete(`${API_END_POINTS.INCOME}/${id}`);
};

// ==================== Expense Endpoints ====================

/**
 * GET /expenses
 * Get all expenses for authenticated user
 * Requires: Bearer token
 * 
 * @returns Array of expense objects
 * 
 * @example
 * ```typescript
 * const expenses = await getExpenses();
 * const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
 * ```
 */
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await axiosConfig.get(API_END_POINTS.EXPENSE);
  return response.data.expenses || response.data.data || response.data;
};

/**
 * POST /expenses
 * Create new expense
 * Requires: Bearer token
 * 
 * @param expense - Expense data
 * @returns Created expense object with ID
 * 
 * @example
 * ```typescript
 * const newExpense = await createExpense({
 *   name: 'Groceries',
 *   category: 'Food',
 *   amount: 150,
 *   date: '2025-12-22',
 *   description: 'Weekly groceries'
 * });
 * ```
 */
export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const response = await axiosConfig.post(API_END_POINTS.EXPENSE, expense);
  return response.data;
};

/**
 * PUT /expenses/:id
 * Update existing expense
 * Requires: Bearer token
 * 
 * @param id - Expense ID
 * @param updates - Partial expense data to update
 * @returns Updated expense object
 * 
 * @example
 * ```typescript
 * const updated = await updateExpense('exp_123', { amount: 200 });
 * ```
 */
export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  const response = await axiosConfig.put(`${API_END_POINTS.EXPENSE}/${id}`, updates);
  return response.data;
};

/**
 * DELETE /expenses/:id
 * Delete expense
 * Requires: Bearer token
 * 
 * @param id - Expense ID
 * @returns Success response
 * 
 * @example
 * ```typescript
 * await deleteExpense('exp_123');
 * ```
 */
export const deleteExpense = async (id: string): Promise<void> => {
  await axiosConfig.delete(`${API_END_POINTS.EXPENSE}/${id}`);
};

// ==================== Category Endpoints ====================

/**
 * GET /categories
 * Get all categories for authenticated user
 * Requires: Bearer token
 * 
 * @returns Array of category objects
 * 
 * @example
 * ```typescript
 * const categories = await getCategories();
 * const incomeCategories = categories.filter(c => c.type === 'income');
 * ```
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosConfig.get(API_END_POINTS.CATEGORY);
  return response.data.categories || response.data.data || response.data;
};

/**
 * POST /categories
 * Create new category
 * Requires: Bearer token
 * 
 * @param category - Category data
 * @returns Created category object with ID
 * 
 * @example
 * ```typescript
 * const newCategory = await createCategory({
 *   name: 'Groceries',
 *   type: 'expense',
 *   color: '#f97316'
 * });
 * ```
 */
export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const response = await axiosConfig.post(API_END_POINTS.CATEGORY, category);
  return response.data;
};

/**
 * PUT /categories/:id
 * Update existing category
 * Requires: Bearer token
 * 
 * @param id - Category ID
 * @param updates - Partial category data to update
 * @returns Updated category object
 * 
 * @example
 * ```typescript
 * const updated = await updateCategory('cat_123', { color: '#ff0000' });
 * ```
 */
export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const response = await axiosConfig.put(`${API_END_POINTS.CATEGORY}/${id}`, updates);
  return response.data;
};

/**
 * DELETE /categories/:id
 * Delete category
 * Requires: Bearer token
 * 
 * @param id - Category ID
 * @returns Success response
 * 
 * @example
 * ```typescript
 * await deleteCategory('cat_123');
 * ```
 */
export const deleteCategory = async (id: string): Promise<void> => {
  await axiosConfig.delete(`${API_END_POINTS.CATEGORY}/${id}`);
};

// ==================== Filter Endpoint ====================

/**
 * POST /filter
 * Filter transactions based on criteria
 * Requires: Bearer token
 * 
 * @param filters - Filter criteria (all fields optional)
 * @returns Array of filtered transaction objects
 * 
 * @example
 * ```typescript
 * // Filter expenses in December
 * const filtered = await filterTransactions({
 *   type: 'expense',
 *   startDate: '2025-12-01',
 *   endDate: '2025-12-31'
 * });
 * 
 * // Filter by category
 * const foodExpenses = await filterTransactions({
 *   category: 'Food',
 *   minAmount: 50
 * });
 * ```
 */
export const filterTransactions = async (filters: FilterRequest): Promise<(Income | Expense)[]> => {
  const response = await axiosConfig.post(API_END_POINTS.FILTER, filters);
  return response.data.transactions || response.data.data || response.data;
};

// ==================== Utility Functions ====================

/**
 * Get all transactions (incomes + expenses)
 * Combines incomes and expenses into single array
 * 
 * @returns Array of all transactions
 * 
 * @example
 * ```typescript
 * const allTransactions = await getAllTransactions();
 * const sorted = allTransactions.sort((a, b) => 
 *   new Date(b.date).getTime() - new Date(a.date).getTime()
 * );
 * ```
 */
export const getAllTransactions = async (): Promise<(Income | Expense)[]> => {
  const [incomes, expenses] = await Promise.all([
    getIncomes(),
    getExpenses(),
  ]);
  return [...incomes, ...expenses];
};

/**
 * Get dashboard data (all data needed for dashboard)
 * Fetches incomes, expenses, and categories in parallel
 * 
 * @returns Dashboard data object
 * 
 * @example
 * ```typescript
 * const dashboardData = await getDashboardData();
 * const totalIncome = dashboardData.incomes.reduce((sum, i) => sum + i.amount, 0);
 * const totalExpense = dashboardData.expenses.reduce((sum, e) => sum + e.amount, 0);
 * ```
 */
export const getDashboardData = async (): Promise<{
  incomes: Income[];
  expenses: Expense[];
  categories: Category[];
}> => {
  const [incomes, expenses, categories] = await Promise.all([
    getIncomes(),
    getExpenses(),
    getCategories(),
  ]);
  return { incomes, expenses, categories };
};

// ==================== Export All ====================

export default {
  // Authentication
  login,
  register,
  
  // Income
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  
  // Expense
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  
  // Category
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Filter
  filterTransactions,
  
  // Utilities
  getAllTransactions,
  getDashboardData,
};
