import { useState } from 'react';
import { Category } from '../App';
import { Plus, Tag, Trash2 } from 'lucide-react';

interface CategoryPageProps {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function CategoryPage({ categories, addCategory, deleteCategory, onRefresh }: CategoryPageProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type)) {
      setError('A category with this name already exists for this type');
      return;
    }

    try {
      setLoading(true);
      await addCategory({ name, type });
      setName('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category. Please try again.');
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Tag className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-gray-600">Manage your income and expense categories</p>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6 font-medium text-lg">Add New Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Groceries, Rent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Type *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'income' | 'expense')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Income Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6 font-medium text-lg">Income Categories</h3>
        {incomeCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No income categories yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomeCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
              >
                <p>{category.name}</p>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6 font-medium text-lg">Expense Categories</h3>
        {expenseCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No expense categories yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseCategories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
              >
                <p>{category.name}</p>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
