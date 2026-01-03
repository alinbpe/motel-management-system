import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { KeyRound, Loader2, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { loading, users } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    const success = await login(username, password);
    if (!success) {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
      )
  }

  // Check if default admin credentials still exist
  const showDefaultCredentials = users.some(u => u.username === 'admin' && u.password === '123');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">ورود به سیستم</h2>
        <p className="text-center text-slate-500 mb-8">لطفا مشخصات خود را وارد کنید</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
            <div className="relative">
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
                placeholder="••••••"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            ورود
          </button>
        </form>
        
        {showDefaultCredentials && (
            <div className="mt-6 text-center text-xs text-gray-400">
            <p>نام کاربری پیش‌فرض: admin</p>
            <p>رمز عبور پیش‌فرض: 123</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;