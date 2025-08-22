
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏗️</span>
            <h1 className="text-xl font-bold">LandSnap</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`hover:text-primary-200 transition-colors ${
                location.pathname === '/' ? 'text-primary-200' : ''
              }`}
            >
              Projects
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
