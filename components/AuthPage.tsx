import React, { useState } from 'react';
import { LeafIcon, UserIcon, LockClosedIcon } from './Icons';
import { getAllUsers, saveUser } from '../services/userService';
import type { User } from '../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { soundService } from '../services/soundService';

interface AuthPageProps {
  onLoginSuccess: (username: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.play('click');
    setError(null);
    if (!username || !password) {
      setError("Username and password cannot be empty.");
      return;
    }
    
    if (isLoginView) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  const handleLogin = () => {
    const users = getAllUsers();
    if (users[username] && users[username].password === password) {
      onLoginSuccess(username);
    } else {
      soundService.play('error');
      setError("Invalid username or password.");
    }
  };
  
  const handleSignup = () => {
    if (password.length < 6) {
        soundService.play('error');
        setError("Password must be at least 6 characters long.");
        return;
    }
    const users = getAllUsers();
    if (users[username]) {
      soundService.play('error');
      setError("Username already exists. Please choose another one.");
    } else {
      const newUser: User = {
        password: password,
        data: {
          history: [],
          purchaseLogs: [],
          stats: { score: 0, scans: 0 },
          settings: {
            theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            isSoundEnabled: true,
          },
          unlockedAchievements: [],
        }
      };
      saveUser(username, newUser);
      onLoginSuccess(username);
    }
  };

  const handleRequestPasswordReset = (resetUsername: string): boolean => {
    const users = getAllUsers();
    if (users[resetUsername]) {
      const newPassword = Math.random().toString(36).slice(-8);
      const updatedUser = { ...users[resetUsername], password: newPassword };
      saveUser(resetUsername, updatedUser);
      alert(
        `Password reset for ${resetUsername}.\n\nYour temporary password is: ${newPassword}\n\nPlease log in and change it immediately from the Profile & Settings page.`
      );
      setIsForgotPasswordOpen(false);
      return true;
    }
    return false;
  };

  const toggleView = () => {
    soundService.play('click');
    setIsLoginView(!isLoginView);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
              <LeafIcon className="w-16 h-16 text-primary mx-auto" />
              <h1 className="mt-2 text-4xl font-bold text-text-primary">Welcome to AgriGuard</h1>
              <p className="mt-2 text-lg text-text-secondary">Your AI-powered farm assistant.</p>
          </div>

          <div className="bg-surface rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-center text-text-primary mb-6">
              {isLoginView ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <UserIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

               {isLoginView && (
                <div className="text-right -mt-2 mb-2">
                    <button
                        type="button"
                        onClick={() => setIsForgotPasswordOpen(true)}
                        className="text-sm font-semibold text-primary hover:underline focus:outline-none"
                    >
                        Forgot Password?
                    </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-[1.02]"
              >
                {isLoginView ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-6">
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={toggleView} className="font-semibold text-primary hover:underline ml-1">
                {isLoginView ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
      {isForgotPasswordOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotPasswordOpen(false)}
          onReset={handleRequestPasswordReset}
        />
      )}
    </>
  );
};