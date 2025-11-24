
import React, { useState } from 'react';
import { HomeIcon, PlusCircleIcon, UserCircleIcon } from './Icons';
import { View } from '../types/index';
import { t } from '../constants/locales';

interface BottomNavProps {
    currentView: View;
    setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const navItems = [
        { view: 'home', icon: HomeIcon, label: t.home },
        { view: 'create', icon: PlusCircleIcon, label: t.create },
        { view: 'profile', icon: UserCircleIcon, label: t.profile },
    ] as const;

    return (
        <nav className="flex justify-around items-center bg-background dark:bg-dark-background border-t border-border-color dark:border-dark-border-color p-2 pb-safe z-10">
            {navItems.map(item => {
                const isActive = currentView === item.view;
                return (
                    <button
                        key={item.view}
                        onClick={() => {
                            // Minimal vibration for nav click
                            if(navigator.vibrate) navigator.vibrate(5);
                            setView(item.view);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 text-primary-text dark:text-dark-primary-text`}
                        aria-label={item.label}
                    >
                        <div className={`transition-all duration-300 ease-bounce-custom ${isActive ? 'transform scale-110' : ''}`}>
                            <item.icon 
                                className={`w-7 h-7 transition-colors duration-300 ${isActive ? 'text-primary-text dark:text-white' : 'text-secondary-text dark:text-gray-500'}`} 
                                fill={isActive ? 'currentColor' : 'none'} 
                            />
                        </div>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;