import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import axiosConfig from '../config/axiosConfig';
import API_END_POINTS from '../config/apiEndpoints';

interface RegisterProps {
  onRegister: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Try API registration first
      try {
        console.log('🔄 Attempting API registration...');
        console.log('📤 Request URL:', axiosConfig.defaults.baseURL + API_END_POINTS.REGISTER);
        console.log('📤 Request body:', { username, email, password: '***' });
        
        const response = await axiosConfig.post(API_END_POINTS.REGISTER, {
          username,
          email,
          password,
        });

        console.log('✅ API registration successful!');
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
          console.warn('⚠️ User data not found in response. Creating user object.');
          user = { email, username };
        }

        console.log('✅ Token extracted:', token.substring(0, 20) + '...');
        console.log('✅ User data:', user);

        // Set token ONLY during register - this is the ONLY place token should be set
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        // IMPORTANT: Set to online mode - data will be stored in database
        localStorage.setItem('backendMode', 'online');
        
        console.log('🔐 Token stored in localStorage - will be used for ALL API calls');
        console.log('🌐 Backend mode: ONLINE - All data will be stored in database');
        onRegister(user, token);
      } catch (apiError: any) {
        console.log('⚠️ Backend server not available - switching to offline mode');
        
        // Fallback to localStorage registration
        if (apiError.code === 'ERR_NETWORK' || apiError.message === 'Network Error' || !apiError.response) {
          console.log('🔄 Using offline registration...');
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          
          // Check if email already exists
          if (users.some((u: any) => u.email === email)) {
            console.log('❌ Email already exists in offline storage');
            setError('Email already exists');
            return;
          }

          const newUser = { 
            id: 'user_' + Date.now(),
            username, 
            email, 
            password 
          };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          
          console.log('✅ Offline registration successful');
          const offlineToken = 'offline_' + Date.now();
          // Set token ONLY during register (offline mode)
          localStorage.setItem('token', offlineToken);
          localStorage.setItem('currentUser', JSON.stringify({ ...newUser, password: undefined }));
          localStorage.setItem('backendMode', 'offline');
          const { password: _, ...userWithoutPassword } = newUser;
          onRegister(userWithoutPassword, offlineToken);
        } else {
          // Backend returned an error (not network error)
          const errorMessage = apiError.response?.data?.message 
            || apiError.response?.data?.error
            || apiError.response?.data?.msg
            || 'Registration failed. Email may already exist.';
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('❌ Unexpected error during registration:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-purple-600">Money Manager</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              placeholder="Create a password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}