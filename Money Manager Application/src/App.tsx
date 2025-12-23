import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { IncomePage } from './components/IncomePage';
import { ExpensePage } from './components/ExpensePage';
import { CategoryPage } from './components/CategoryPage';
import { FilterPage } from './components/FilterPage';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile, UserProfile } from './components/Profile';
import { About } from './components/About';
import * as apiService from './services/apiService';
import './utils/tokenManager'; // Load token manager utility

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  name?: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'income' | 'expense' | 'category' | 'filter' | 'profile' | 'about'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendMode, setBackendMode] = useState<'online' | 'offline'>('online');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const authUser = localStorage.getItem('currentUser');
    // Default to 'online' mode - data should be stored in database
    const mode = localStorage.getItem('backendMode') || 'online';
    
    // If user is logged in, ensure online mode (database storage)
    if (token && authUser) {
      localStorage.setItem('backendMode', 'online');
      setBackendMode('online');
      setCurrentUser(JSON.parse(authUser));
      setIsAuthenticated(true);
      console.log('🌐 Backend mode: ONLINE - Data will be stored in database');
    } else {
      setBackendMode(mode as 'online' | 'offline');
      setLoading(false);
    }
  }, []);

  // Load user data from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      
      console.log('🔄 Loading user data from backend...');
      
      // Fetch all data from backend
      const [incomes, expenses, categoriesData] = await Promise.all([
        apiService.fetchIncomes(),
        apiService.fetchExpenses(),
        apiService.fetchCategories(),
      ]);

      console.log('✅ Data loaded successfully');
      console.log('📥 Incomes:', incomes);
      console.log('📥 Expenses:', expenses);
      console.log('📥 Categories:', categoriesData);

      // Transform data - ensure name field is preserved
      const allTransactions: Transaction[] = [
        ...incomes.map((income: any) => ({ 
          ...income, 
          type: 'income' as const,
          name: income.name || undefined, // Ensure name field is included
        })),
        ...expenses.map((expense: any) => ({ 
          ...expense, 
          type: 'expense' as const,
          name: expense.name || undefined, // Ensure name field is included
        })),
      ];

      setTransactions(allTransactions);
      const fallbackColors = [
        '#10b981', '#34d399', '#6ee7b7', '#ef4444', '#f87171', '#fca5a5', '#dc2626'
      ];
      const categoriesWithColor = categoriesData.map((cat: any, idx: number) => ({
        ...cat,
        color: cat.color || fallbackColors[idx % fallbackColors.length],
      }));
      setCategories(categoriesWithColor);
    } catch (error: any) {
      console.error('❌ Error loading user data:', error);
      setError('Failed to load data from server. Please check your connection.');
      
      // If backend is not available, use default categories
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('⚠️ Backend unavailable - using default categories');
        const defaultCategories: Category[] = [
          { id: '1', name: 'Salary', type: 'income', color: '#10b981' },
          { id: '2', name: 'Freelance', type: 'income', color: '#34d399' },
          { id: '3', name: 'Investment', type: 'income', color: '#6ee7b7' },
          { id: '4', name: 'Food', type: 'expense', color: '#ef4444' },
          { id: '5', name: 'Transport', type: 'expense', color: '#f87171' },
          { id: '6', name: 'Entertainment', type: 'expense', color: '#fca5a5' },
          { id: '7', name: 'Bills', type: 'expense', color: '#dc2626' },
        ];
        setCategories(defaultCategories);
      }
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handleLogin = (user: any, token: string) => {
    console.log('✅ User logged in:', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleRegister = (user: any, token: string) => {
    console.log('✅ User registered:', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    console.log('🔄 Logging out user...');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTransactions([]);
    setCategories([]);
    setCurrentPage('dashboard');
    // Clear token - this is the ONLY place token should be cleared (except 401 errors)
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('backendMode');
    console.log('🔓 Token cleared - user logged out');
  };

  const handleUpdateProfile = async (updatedUser: UserProfile) => {
    try {
      // You can add API call here to update profile on backend
      // const response = await axiosConfig.put('/profile', updatedUser);
      
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      console.log('🔄 Adding transaction to backend:', transaction);
      
      // Validate transaction data before sending
      if (!transaction.category) {
        throw new Error('Category is required');
      }
      if (!transaction.amount || transaction.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!transaction.date) {
        throw new Error('Date is required');
      }
      
      let newTransaction: Transaction;
      
      if (transaction.type === 'income') {
        const incomeData = {
          name: transaction.name,
          categoryId: Number(transaction.category),
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
        };
        console.log('📤 Sending income data:', incomeData);
        
        try {
          const response = await apiService.createIncome(incomeData);
          console.log('📥 Backend response:', response);
          const chosenCategory = categories.find(c => String(c.id) === transaction.category);
          newTransaction = { 
            ...response, 
            type: 'income',
            name: response.name || transaction.name || undefined,
            category: chosenCategory?.name || transaction.category,
          };
          console.log('✅ Final income transaction:', newTransaction);
        } catch (incomeError: any) {
          console.error('❌ Error in createIncome:', incomeError);
          // Re-throw with more context
          throw new Error(incomeError.message || 'Failed to create income. Please check console for details.');
        }
      } else {
        const expenseData = {
          name: transaction.name,
          categoryId: Number(transaction.category),
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
        };
        console.log('📤 Sending expense data:', expenseData);
        
        try {
          const response = await apiService.createExpense(expenseData);
          console.log('📥 Backend response:', response);
          const chosenCategory = categories.find(c => String(c.id) === transaction.category);
          newTransaction = { 
            ...response, 
            type: 'expense',
            name: response.name || transaction.name || undefined,
            category: chosenCategory?.name || transaction.category,
          };
          console.log('✅ Final expense transaction:', newTransaction);
        } catch (expenseError: any) {
          console.error('❌ Error in createExpense:', expenseError);
          // Re-throw with more context
          throw new Error(expenseError.message || 'Failed to create expense. Please check console for details.');
        }
      }
      
      // Update local state
      setTransactions([newTransaction, ...transactions]);
    } catch (error: any) {
      console.error('❌ Error adding transaction:', error);
      console.error('❌ Error stack:', error.stack);
      // Re-throw the error so the UI can display it
      throw error;
    }
  };

  const deleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      console.log('🔄 Deleting transaction:', id, type);
      
      if (type === 'income') {
        await apiService.deleteIncome(id);
      } else {
        await apiService.deleteExpense(id);
      }
      
      console.log('✅ Transaction deleted');
      
      // Update local state
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      console.log('🔄 Adding category to backend:', category);
      
      const newCategory = await apiService.createCategory(category);
      console.log('✅ Category created:', newCategory);
      
      // Update local state
      setCategories([...categories, newCategory]);
    } catch (error: any) {
      console.error('❌ Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log('🔄 Deleting category:', id);
      
      await apiService.deleteCategory(id);
      console.log('✅ Category deleted');
      
      // Update local state
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error: any) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={currentUser!}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Offline Mode Indicator */}
        {backendMode === 'offline' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium">Offline Mode</span> - Backend server not available. All data is stored locally.
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadUserData()}
              className="text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {dataLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading data from server...</span>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            onRefresh={loadUserData}
          />
        )}
        {currentPage === 'income' && (
          <IncomePage 
            transactions={transactions.filter(t => t.type === 'income')} 
            categories={categories.filter(c => c.type === 'income')}
            addTransaction={addTransaction}
            deleteTransaction={deleteTransaction}
            onRefresh={loadUserData}
          />
        )}
        {currentPage === 'expense' && (
          <ExpensePage 
            transactions={transactions.filter(t => t.type === 'expense')} 
            categories={categories.filter(c => c.type === 'expense')}
            addTransaction={addTransaction}
            deleteTransaction={deleteTransaction}
            onRefresh={loadUserData}
          />
        )}
        {currentPage === 'category' && (
          <CategoryPage 
            categories={categories}
            addCategory={addCategory}
            deleteCategory={deleteCategory}
            onRefresh={loadUserData}
          />
        )}
        {currentPage === 'filter' && (
          <FilterPage 
            transactions={transactions}
            categories={categories}
            onRefresh={loadUserData}
          />
        )}
        {currentPage === 'profile' && (
          <Profile 
            user={currentUser!}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {currentPage === 'about' && (
          <About />
        )}
      </main>
    </div>
  );
}