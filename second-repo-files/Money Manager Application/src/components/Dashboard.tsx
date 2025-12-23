import { useMemo } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Transaction, Category } from '../App';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  onRefresh?: () => void;
}

export function Dashboard({ transactions, categories, onRefresh }: DashboardProps) {
  // Compute totals and balance
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [transactions]);



  // Line chart data grouped by month
  const lineChartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; income: number; expense: number; year: number; monthNum: number }>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const monthNum = date.getMonth();
      const monthKey = `${year}-${monthNum}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { month: monthLabel, income: 0, expense: 0, year, monthNum });
      }

      const entry = monthMap.get(monthKey)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    });

    return Array.from(monthMap.values())
      .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum))
      .slice(-6)
      .map(({ month, income, expense }) => ({ month, income, expense }));
  }, [transactions]);

  // Pie chart data helper with "Uncategorized"
  const getPieData = (type: 'income' | 'expense') => {
  const categoryMap = new Map<string, number>();

  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      // Use the category if it exists, otherwise "Uncategorized"
      const catName = t.category?.trim() || 'Uncategorized';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
    });

  return Array.from(categoryMap.entries())
    .map(([name, value]) => {
      // Try to find the category color from categories array
      const category = categories.find(c => c.name === name);
      return {
        name, // This will now always show the actual category name or fallback
        value,
        color: category?.color || (type === 'income' ? '#10b981' : '#ef4444'),
      };
    })
    .filter(entry => entry.value > 0); // remove empty categories
};

  const incomePieData = useMemo(() => getPieData('income'), [transactions, categories]);
  const expensePieData = useMemo(() => getPieData('expense'), [transactions, categories]);

  return (
    <div className="space-y-8">
      <h2 className="mb-6 text-xl font-semibold">Financial Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Income</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-600">${stats.totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Expense</span>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-red-600">${stats.totalExpense.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Balance</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className={stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}>
            ${stats.balance.toFixed(2)}
          </p>
        </div>
      </div>

      

      {/* Line Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="mb-6">Monthly Income vs Expense Trend</h3>
        {lineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '14px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '14px' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
              <Legend iconType="line" />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            No transaction data available. Add some income or expenses to see the trend!
          </div>
        )}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Pie */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-6">Income by Category</h3>
          {incomePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                >
                  {incomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No income data available</div>
          )}
        </div>

        {/* Expense Pie */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-6">Expense by Category</h3>
          {expensePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No expense data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
