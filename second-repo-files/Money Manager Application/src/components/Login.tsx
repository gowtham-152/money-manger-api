import { useState } from 'react';
import { LogIn } from 'lucide-react';
import axiosConfig from '../config/axiosConfig';
import API_END_POINTS from '../config/apiEndpoints';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Try API login first
      try {
        console.log('🔄 Attempting API login...');
        console.log('📤 Request URL:', axiosConfig.defaults.baseURL + API_END_POINTS.LOGIN);
        console.log('📤 Request body:', { email, password: '***' });
        
        const response = await axiosConfig.post(API_END_POINTS.LOGIN, { 
          email, 
          password 
        });
        
        console.log('✅ API login successful!');
        console.log('📥 Response status:', response.status);
        console.log('📥 Response data:', response.data);

        // Handle different response formats
        let token = null;
        let user = null;

        // Format 1: { token, user }
        if (response.data.token && response.data.user) {
          token = response.data.token;
          user = response.data.user;
        }
        // Format 2: { success, token, data: { user } }
        else if (response.data.success && response.data.token && response.data.data?.user) {
          token = response.data.token;
          user = response.data.data.user;
        }
        // Format 3: { accessToken, user }
        else if (response.data.accessToken && response.data.user) {
          token = response.data.accessToken;
          user = response.data.user;
        }
        // Format 4: { data: { token, user } }
        else if (response.data.data?.token && response.data.data?.user) {
          token = response.data.data.token;
          user = response.data.data.user;
        }

        if (!token) {
          console.warn('⚠️ Token not found in response. Response structure:', response.data);
          throw new Error('Invalid response from server');
        }

        if (!user) {
          console.warn('⚠️ User data not found in response. Using email as fallback.');
          user = { email, username: email.split('@')[0] };
        }

        console.log('✅ Token extracted:', token.substring(0, 20) + '...');
        console.log('✅ User data:', user);

        // Set token ONLY during login - this is the ONLY place token should be set
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        // IMPORTANT: Set to online mode - data will be stored in database
        localStorage.setItem('backendMode', 'online');
        
        console.log('🔐 Token stored in localStorage - will be used for ALL API calls');
        console.log('🌐 Backend mode: ONLINE - All data will be stored in database');
        onLogin(user, token);
      } catch (apiError: any) {
        console.log('⚠️ Backend server not available - switching to offline mode');
        
        // Fallback to localStorage authentication
        if (apiError.code === 'ERR_NETWORK' || apiError.message === 'Network Error' || !apiError.response) {
          console.log('🔄 Using offline authentication...');
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find((u: any) => u.email === email && u.password === password);
          
          if (user) {
            console.log('✅ Offline login successful');
            const offlineToken = 'offline_' + Date.now();
            // Set token ONLY during login (offline mode)
            localStorage.setItem('token', offlineToken);
            localStorage.setItem('currentUser', JSON.stringify({ ...user, password: undefined }));
            localStorage.setItem('backendMode', 'offline');
            const { password: _, ...userWithoutPassword } = user;
            onLogin(userWithoutPassword, offlineToken);
          } else {
            console.log('❌ Offline login failed - user not found');
            setError('Invalid email or password. (Offline Mode - Create an account first)');
          }
        } else {
          // Backend returned an error (not network error)
          const errorMessage = apiError.response?.data?.message 
            || apiError.response?.data?.error
            || apiError.response?.data?.msg
            || 'Invalid email or password';
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('❌ Unexpected error during login:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-blue-600">Money Manager</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}