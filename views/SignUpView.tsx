
import React, { useState } from 'react';
import { t } from '../constants/locales';
import * as userService from '../services/userService';
import { User } from '../types/index';

interface SignUpViewProps {
    onSignUp: (user: User) => void;
    onNavigateToLogin: () => void;
}

const SignUpView: React.FC<SignUpViewProps> = ({ onSignUp, onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Organically request notification permission on user interaction
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        if (!email.trim() || !password.trim() || isLoading) return;

        setIsLoading(true);

        try {
            const user = await userService.signUpUser(email, password);
            if (user) {
                onSignUp(user);
            } else {
                setError('Failed to create account. Check email format.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during sign up.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-background p-8 animate-fade-in">
            <h1 className="text-5xl font-bold text-primary-text dark:text-dark-primary-text mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>Lastbench</h1>
            <p className="mb-12 text-xl text-secondary-text dark:text-dark-secondary-text">{t.splashTagline}</p>
            
            <form onSubmit={handleSignUp} className="w-full max-w-sm flex flex-col gap-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    aria-label="Email"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    aria-label={t.passwordPlaceholder}
                />
                 <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full bg-gray-100 dark:bg-dark-border-color border border-border-color dark:border-dark-border-color rounded-lg py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    aria-label={t.confirmPasswordPlaceholder}
                />
                {error && <p className="text-red-500 text-sm text-center -mt-2">{error}</p>}
                <button
                    type="submit"
                    disabled={!email.trim() || !password.trim() || !confirmPassword.trim() || isLoading}
                    className="w-full bg-accent-primary hover:bg-accent-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isLoading ? 'Creating Account...' : t.signUp}
                </button>
            </form>
             <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-6">
                {t.alreadyHaveAccount} <button onClick={onNavigateToLogin} className="font-bold text-accent-primary hover:underline">{t.login}</button>
            </p>
        </div>
    );
};

export default SignUpView;
