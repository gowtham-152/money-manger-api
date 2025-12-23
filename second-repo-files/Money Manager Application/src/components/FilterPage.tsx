import { useState, useMemo } from 'react';
import { Transaction, Category } from '../App';
import { Filter, Calendar, TrendingUp, TrendingDown, X, Search } from 'lucide-react';
import * as apiService from '../services/apiService';

interface FilterPageProps {
  transactions: Transaction[];
  categories: Category[];
  onRefresh?: () => void;
}

export function FilterPage({ transactions, categories, onRefresh }: FilterPageProps) {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');
  const [useBackendFilter, setUseBackendFilter] = useState(false);
  const [backendResults, setBackendResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    if (useBackendFilter) {
      return backendResults;
    }

    return transactions.filter((transaction) => {
      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && transaction.category !== filterCategory) {
        return false;
      }

      // Date from filter
      if (filterDateFrom && new Date(transaction.date) < new Date(filterDateFrom)) {
        return false;
      }

      // Date to filter
      if (filterDateTo && new Date(transaction.date) > new Date(filterDateTo)) {
        return false;
      }

      // Amount min filter
      if (filterAmountMin && transaction.amount < parseFloat(filterAmountMin)) {
        return false;
      }

      // Amount max filter
      if (filterAmountMax && transaction.amount > parseFloat(filterAmountMax)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax, useBackendFilter, backendResults]);

  // Backend filtering
  const handleBackendFilter = async () => {
    try {
      setLoading(true);
      console.log('🔄 Applying backend filter...');
      
      const filters: any = {};
      
      if (filterType !== 'all') {
        filters.type = filterType;
      }
      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }
      if (filterDateFrom) {
        filters.startDate = filterDateFrom;
      }
      if (filterDateTo) {
        filters.endDate = filterDateTo;
      }
      if (filterAmountMin) {
        filters.minAmount = parseFloat(filterAmountMin);
      }
      if (filterAmountMax) {
        filters.maxAmount = parseFloat(filterAmountMax);
      }

      console.log('📤 Filter params:', filters);
      
      const results = await apiService.filterTransactions(filters);
      console.log('✅ Backend filter results:', results);
      
      setBackendResults(results);
      setUseBackendFilter(true);
    } catch (error: any) {
      console.error('❌ Backend filter failed:', error);
      // Fallback to client-side filtering
      setUseBackendFilter(false);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { totalIncome, totalExpense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  const availableCategories = useMemo(() => {
    if (filterType === 'all') {
      return categories;
    }
    return categories.filter(c => c.type === filterType);
  }, [categories, filterType]);

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterAmountMin('');
    setFilterAmountMax('');
    setUseBackendFilter(false);
    setBackendResults([]);
  };

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterDateFrom || filterDateTo || filterAmountMin || filterAmountMax;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Filter className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2>Filter Transactions</h2>
            <p className="text-gray-600">Search and filter your financial records</p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6">Filter Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'all' | 'income' | 'expense');
                setFilterCategory('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filterAmountMin}
              onChange={(e) => setFilterAmountMin(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Max Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={filterAmountMax}
              onChange={(e) => setFilterAmountMax(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleBackendFilter}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Apply Backend Filter
          </button>
        </div>
      </div>

      {/* Filter Results Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Total Transactions</p>
          <p>{stats.count}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Total Income</p>
          <p className="text-green-600">${stats.totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">Total Expense</p>
          <p className="text-red-600">${stats.totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtered Results */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6">
          Filtered Results ({filteredTransactions.length})
        </h3>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No transactions match your filters
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const category = categories.find(c => c.name === transaction.category);
              const isIncome = transaction.type === 'income';
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: (category?.color || (isIncome ? '#10b981' : '#ef4444')) + '20',
                      }}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-5 h-5" style={{ color: category?.color || '#10b981' }} />
                      ) : (
                        <TrendingDown className="w-5 h-5" style={{ color: category?.color || '#ef4444' }} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p>{transaction.category}</p>
                        <span className={`px-2 py-0.5 rounded text-white ${
                          isIncome ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-gray-500">{transaction.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className={isIncome ? 'text-green-600' : 'text-red-600'}>
                    {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}