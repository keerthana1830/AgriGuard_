import React, { useState, useEffect, useRef } from 'react';
import { LeafIcon, DocumentDuplicateIcon, ChatBubbleLeftRightIcon, MapIcon, BookOpenIcon, ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon, ChevronDownIcon, TrophyIcon } from './Icons';
import { soundService } from '../services/soundService';
import type { UserSettings } from '../types';

type View = 'dashboard' | 'history' | 'field' | 'resources' | 'profile' | 'achievements';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onChatToggle: () => void;
  username: string;
  onLogout: () => void;
  settings: UserSettings;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onChatToggle, username, onLogout, settings }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LeafIcon },
    { id: 'field', label: 'Field Health', icon: MapIcon },
    { id: 'history', label: 'History', icon: DocumentDuplicateIcon },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
    { id: 'resources', label: 'Resources', icon: BookOpenIcon },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleNavClick = (view: View) => {
    soundService.play('click');
    setCurrentView(view);
  };
  
  const handleChatClick = () => {
    soundService.play('click');
    onChatToggle();
  };

  const handleProfileClick = () => {
    soundService.play('click');
    setCurrentView('profile');
    setIsDropdownOpen(false);
  };
  
  const handleLogoutClick = () => {
    soundService.play('click');
    onLogout();
    setIsDropdownOpen(false);
  };
  
  const handleDropdownToggle = () => {
    soundService.play('click');
    setIsDropdownOpen(prev => !prev);
  }

  return (
    <header className="bg-surface shadow-md sticky top-0 z-20 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center">
            <LeafIcon className="w-8 h-8 text-primary" />
            <span className="ml-2 text-2xl font-bold text-text-primary">AgriGuard</span>
          </div>

          <nav className="hidden md:flex items-center space-x-2 bg-background p-1 rounded-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as View)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  currentView === item.id
                    ? 'bg-surface text-primary shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleChatClick}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors bg-primary text-white hover:bg-primary-dark"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
            
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={handleDropdownToggle}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full bg-background hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="w-8 h-8 bg-surface rounded-full shadow-sm overflow-hidden flex items-center justify-center">
                       {settings.profilePicture ? (
                          <img src={settings.profilePicture} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                          <UserIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-text-primary hidden lg:inline">{username}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-text-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5">
                        <button
                            onClick={handleProfileClick}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                            <Cog6ToothIcon className="w-5 h-5 mr-2" />
                            Profile & Settings
                        </button>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
      
       <nav className="md:hidden flex items-center justify-around bg-surface p-2 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id as View)}
            className={`flex flex-col items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full ${
              currentView === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};