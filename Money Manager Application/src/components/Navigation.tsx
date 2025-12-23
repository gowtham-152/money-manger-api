import { useState, useRef, useEffect } from 'react';
import { Home, TrendingUp, TrendingDown, Tag, Filter, User, LogOut, Info, ChevronDown } from 'lucide-react';
import { UserProfile } from './Profile';

interface NavigationProps {
  currentPage: 'dashboard' | 'income' | 'expense' | 'category' | 'filter' | 'profile' | 'about';
  setCurrentPage: (page: 'dashboard' | 'income' | 'expense' | 'category' | 'filter' | 'profile' | 'about') => void;
  user: UserProfile;
  onLogout: () => void;
}

export function Navigation({ currentPage, setCurrentPage, user, onLogout }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expense', label: 'Expense', icon: TrendingDown },
    { id: 'category', label: 'Categories', icon: Tag },
    { id: 'filter', label: 'Filter', icon: Filter },
  ] as const;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-blue-600">Money Manager</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="hidden md:inline text-gray-700">{user.username}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-gray-900">{user.username}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('about');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    About
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
