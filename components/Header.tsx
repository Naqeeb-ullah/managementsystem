
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="bg-card shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            EventHive
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-text-secondary hover:text-primary transition-colors">
              Events
            </Link>
            {user && (
              <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-3">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-primary" />
                <span className="font-medium hidden sm:block">{user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-semibold"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </nav>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
