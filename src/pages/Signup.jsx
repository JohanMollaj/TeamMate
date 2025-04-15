import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password, username);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setError('Failed to create an account. ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="auth-card w-full max-w-md p-8 rounded-xl shadow-lg bg-[var(--bg-secondary)]">
        <div className="auth-header text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Create an Account</h1>
          <p className="text-[var(--text-secondary)] mt-2">Join TeamMate today!</p>
        </div>
        
        {error && (
          <div className="auth-error bg-red-500/10 text-red-500 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
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
          
          <div className="form-group mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Password
            </label>
            <div className="relative flex justify-center items-center">
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
                className="absolute top-0 bottom-2.5 right-0 px-3 flex items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="form-group mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder='Confirm your password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--button-active)] text-white rounded-lg hover:bg-[var(--sidebar-button)] transition-colors disabled:bg-gray-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <div className="auth-footer mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--button-active)] hover:text-[var(--sidebar-button)]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;