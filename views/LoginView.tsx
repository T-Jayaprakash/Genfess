
import React, { useState } from 'react';
import { t } from '../constants/locales';
import * as userService from '../services/userService';
import { User } from '../types/index';

interface LoginViewProps {
    onLogin: (user: User) => void;
    onNavigateToSignUp: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Organically request notification permission on user interaction (like social media apps)
        if ('Notification' in window && Notification.permission === 'default') {
            // We don't await this to keep the login flow snappy
            Notification.requestPermission();
        }

        if (!email.trim() || !password.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const user = await userService.loginUser(email, password);
            if (user) {
                onLogin(user);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-background p-8 animate-fade-in">
            <h1 className="text-5xl font-bold text-primary-text dark:text-dark-primary-text mb-4" style={{ fontFamily: "'Roboto', sans-serif" }}>Genfess</h1>
            <p className="mb-12 text-xl text-secondary-text dark:text-dark-secondary-text">{t.splashTagline}</p>

            <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
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
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={!email.trim() || !password.trim() || isLoading}
                    className="w-full bg-accent-primary hover:bg-accent-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isLoading ? t.loggingIn : t.login}
                </button>
            </form>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-6">
                {t.noAccount} <button onClick={onNavigateToSignUp} className="font-bold text-accent-primary hover:underline">{t.signUp}</button>
            </p>
        </div>
    );
};

export default LoginView;
