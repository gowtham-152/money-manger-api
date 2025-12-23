import { useState } from 'react';
import { Transaction, Category } from '../App';
import { Plus, TrendingUp, Calendar, RefreshCw, Trash2 } from 'lucide-react';

interface IncomePageProps {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction?: (id: string, type: 'income' | 'expense') => Promise<void>;
  onRefresh?: () => void;
}

export function IncomePage({ transactions, categories, addTransaction, deleteTransaction, onRefresh }: IncomePageProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!name || !name.trim()) {
      setError('Please enter an income name');
      return;
    }
    
    if (!amount || amount.trim() === '') {
      setError('Please enter an amount');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    
    if (!date) {
      setError('Please select a date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await addTransaction({
        type: 'income',
        name: name.trim(),
        category: categoryId,
        amount: parsedAmount,
        date,
        description: description || undefined,
      });

      // Reset form on success
      setName('');
      setAmount('');
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      console.error('❌ Error adding income:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Show detailed error message
      let errorMessage = 'Failed to add income. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all fields.';
      } else if (err.response?.status === 422) {
        errorMessage = 'Validation error. Please check your input.';
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2>Income</h2>
          <p className="text-gray-600">Add and manage your income</p>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <p className="opacity-90">Total Income</p>
        <p className="mt-2">${totalIncome.toFixed(2)}</p>
      </div>

      {/* Add Income Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6">Add New Income</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Income Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Salary, Freelance, Bonus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
              </svg>
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Add Income
          </button>
        </form>
      </div>

      {/* Recent Income */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6">Recent Income</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No income records yet. Add your first income above!
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: categories.find(c => c.name === transaction.category)?.color + '20' || '#10b98120',
                    }}
                  >
                    <TrendingUp className="w-5 h-5" style={{
                      color: categories.find(c => c.name === transaction.category)?.color || '#10b981',
                    }} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name || transaction.category}</p>
                    <p className="text-gray-500 text-sm">{transaction.category}</p>
                    {transaction.description && (
                      <p className="text-gray-500 text-sm mt-1">{transaction.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-green-600">
                    +${transaction.amount.toFixed(2)}
                  </p>
                  {deleteTransaction && (
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteTransaction(transaction.id, 'income')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}