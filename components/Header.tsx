import React from 'react';
import { User } from '../types/index';
import NotificationBell from './NotificationBell';

interface HeaderProps {
    isVisible?: boolean;
    user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ isVisible = true, user }) => {
    return (
        <header
            className={`absolute top-0 left-0 right-0 z-30 bg-background/95 dark:bg-dark-background/95 backdrop-blur-sm px-4 py-3 border-b border-border-color dark:border-dark-border-color transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'} flex justify-between items-center`}
            style={{ paddingTop: 'max(env(safe-area-inset-top) + 12px, 24px)' }}
        >
            {/* Left spacer */}
            <div className="flex-1"></div>

            {/* Centered logo */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 select-none" style={{ fontFamily: "'Satisfy', cursive", letterSpacing: '0.5px' }}>
                Lastbench
            </h1>

            {/* Right side - Notification Bell */}
            <div className="flex-1 flex justify-end">
                {user && <NotificationBell userId={user.userId} />}
            </div>
        </header>
    );
};

export default Header;
