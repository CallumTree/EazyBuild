
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import { MapPage } from './pages/MapPage';
import { FinancePage } from './pages/FinancePage';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/project/:id/map" element={<MapPage />} />
          <Route path="/project/:id/finance" element={<FinancePage />} />
        </Routes>
      </div>
    </Router>
  );
}
