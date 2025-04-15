import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="auth-card w-full max-w-md p-8 rounded-xl shadow-lg bg-[var(--bg-secondary)]">
        <div className="auth-header text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Login to TeamMate</h1>
          <p className="text-[var(--text-secondary)] mt-2">Welcome back! Please enter your details.</p>
        </div>
        
        {error && (
          <div className="auth-error bg-red-500/10 text-red-500 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div className="form-group mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg pr-10 focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-[var(--bg-input)] border-[var(--border-color)] rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-secondary)]">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="text-[var(--button-active)] hover:text-[var(--text-primary)]">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--button-active)] text-white rounded-lg hover:bg-[var(--sidebar-button)] transition-colors disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        
        <div className="auth-footer mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[var(--button-active)] hover:text-[var(--sidebar-button)]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;