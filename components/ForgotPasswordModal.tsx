import React, { useState } from 'react';
import { UserIcon, LeafIcon } from './Icons';

interface ForgotPasswordModalProps {
    onClose: () => void;
    onReset: (username: string) => boolean; // Returns true on success, false on failure
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onReset }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim()) {
            setError("Please enter a username.");
            return;
        }

        const success = onReset(username);
        if (!success) {
            setError("Username not found. Please check and try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-surface rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-6">
                    <LeafIcon className="w-12 h-12 text-primary mx-auto" />
                    <h2 className="mt-2 text-2xl font-bold text-text-primary">Forgot Password</h2>
                    <p className="mt-1 text-text-secondary">Enter your username to reset your password.</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                        <span>{error}</span>
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
                            required
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row-reverse gap-3 pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-[1.02]"
                        >
                            Reset Password
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-200 dark:bg-slate-600 text-text-primary font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
              @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
              }
            `}</style>
        </div>
    );
};