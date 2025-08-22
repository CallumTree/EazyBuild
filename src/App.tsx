
import React from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import './App.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed topbar */}
      <Topbar />
      
      {/* Main content area with sidebar and map */}
      <div className="pt-14 flex h-screen">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Map canvas - takes remaining space */}
        <MapCanvas />
      </div>

      {/* Mobile sidebar overlay - for future mobile implementation */}
      {/* This would be implemented with a slide-out drawer on mobile */}
    </div>
  );
}
