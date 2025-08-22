
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const FinancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to={`/project/${id}`} className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Project
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Finance Calculator</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Analysis Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            Comprehensive financial modeling for development feasibility
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>GDV (Gross Development Value)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Build costs estimation</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Professional fees</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Contingency calculations</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Profit margins</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✅</span>
              <span>Residual Land Value (RLV)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
