'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div 
        className="bg-[#252525] rounded-2xl p-8 max-w-md w-[90%] shadow-2xl border border-[#3d3d3d]"
      >
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#888] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#89dceb] transition"
              required
            />
          </div>
          
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-[#888] mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#89dceb] transition"
                required
                minLength={3}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm text-[#888] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#89dceb] transition"
              required
              minLength={6}
            />
          </div>
          
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-[#888] mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#89dceb] transition"
                required
                minLength={6}
              />
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#89dceb] hover:bg-[#79c8db] disabled:bg-[#3d3d3d] text-[#1a1a1a] font-semibold py-2.5 rounded-lg transition mt-2"
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-[#89dceb] hover:text-[#79c8db] transition"
          >
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full bg-[#333] hover:bg-[#444] text-white font-medium py-2.5 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}