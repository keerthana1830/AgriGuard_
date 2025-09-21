import React, { useState, useEffect } from 'react';
import App from './App';
import { AuthPage } from './components/AuthPage';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './services/userService';

const AppWrapper: React.FC = () => {
  const [currentUser, _setCurrentUser] = useState<string | null>(getCurrentUser());

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    _setCurrentUser(username);
  };

  const handleLogout = () => {
    clearCurrentUser();
    _setCurrentUser(null);
  };

  if (currentUser) {
    return <App username={currentUser} onLogout={handleLogout} />;
  } else {
    return <AuthPage onLoginSuccess={handleLogin} />;
  }
};

export default AppWrapper;
