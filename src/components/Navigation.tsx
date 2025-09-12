
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Home, 
  Calculator, 
  TrendingUp, 
  FileText 
} from 'lucide-react';

const tabs = [
  { path: '/', icon: MapPin, label: 'Survey' },
  { path: '/layout', icon: Home, label: 'Layout' },
  { path: '/finance', icon: Calculator, label: 'Finance' },
  { path: '/market', icon: TrendingUp, label: 'Market' },
  { path: '/offer', icon: FileText, label: 'Offer' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <ul>
        {tabs.map(({ path, icon: Icon, label }) => (
          <li key={path}>
            <button
              onClick={() => navigate(path)}
              className={location.pathname === path ? 'active' : ''}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
