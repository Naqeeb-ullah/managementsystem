
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoggingIn } = useAuth();

  const handleLogin = async (email: string) => {
    await login(email);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to EventHive</h2>
          <p className="text-text-secondary mb-6">Select a mock user to sign in.</p>
        </div>
        <div className="space-y-4">
           <button 
             onClick={() => handleLogin('attendee@example.com')} 
             disabled={isLoggingIn}
             className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors disabled:bg-indigo-300 flex items-center justify-center">
             {isLoggingIn ? 'Signing In...' : 'Sign in as Attendee'}
           </button>
           <button 
             onClick={() => handleLogin('organizer@example.com')} 
             disabled={isLoggingIn}
             className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 flex items-center justify-center">
             {isLoggingIn ? 'Signing In...' : 'Sign in as Organizer'}
           </button>
        </div>
         <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.2s forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthModal;
