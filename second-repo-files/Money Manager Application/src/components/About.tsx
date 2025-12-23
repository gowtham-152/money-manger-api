import { Info, DollarSign, TrendingUp, PieChart, Filter, Code, Heart } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Info className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2>About Money Manager</h2>
          <p className="text-gray-600">Learn about this application</p>
        </div>
      </div>

      {/* What is Money Manager */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-4">What is Money Manager?</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Money Manager is a comprehensive financial tracking application designed to help you take control of your personal finances. 
          With an intuitive interface and powerful features, you can easily track your income and expenses, visualize your spending 
          patterns, and make informed financial decisions.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Whether you're saving for a goal, managing your budget, or simply want to understand where your money goes, 
          Money Manager provides the tools you need to achieve financial clarity and success.
        </p>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Income & Expense Tracking</p>
              <p className="text-gray-600">Easily record and categorize all your financial transactions</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Visual Analytics</p>
              <p className="text-gray-600">View monthly trends with interactive line charts</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Category Insights</p>
              <p className="text-gray-600">Understand spending patterns with pie chart breakdowns</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Advanced Filtering</p>
              <p className="text-gray-600">Filter transactions by date, amount, and category</p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="mb-4">How to Use</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-gray-900 mb-1">Set Up Categories</p>
              <p className="text-gray-600">Create custom categories for your income and expenses in the Categories page</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-gray-900 mb-1">Add Transactions</p>
              <p className="text-gray-600">Record your income and expenses with amounts, dates, and descriptions</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-gray-900 mb-1">Monitor Dashboard</p>
              <p className="text-gray-600">View your financial overview with charts and statistics</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-gray-900 mb-1">Analyze & Filter</p>
              <p className="text-gray-600">Use the Filter page to analyze specific time periods or categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6" />
          <h3 className="text-white">Built With Passion</h3>
        </div>
        <p className="text-white/90 mb-4">
          This application was developed by <span className="font-semibold">GOWTHAM S</span> to provide a simple, 
          efficient, and user-friendly way to manage personal finances.
        </p>
        <div className="flex items-center gap-2 text-white/90">
          <Heart className="w-5 h-5 text-red-300" />
          <span>Made with dedication to help you achieve financial wellness</span>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-600">Version 1.0.0 | © 2024 Money Manager</p>
      </div>
    </div>
  );
}