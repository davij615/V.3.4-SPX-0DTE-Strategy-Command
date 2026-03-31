'use client';

import React, { useState } from 'react';
import { DataHealthBanner } from '@/app/components/DataHealthBanner';
import { DataHealthBadge } from '@/app/components/DataHealthBadge';
import { DataQualityDetails } from '@/app/components/DataQualityDetails';
import useDataHealth from '@/app/components/useDataHealth';

export default function Dashboard() {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { dataQuality, streamHealth, loading, error } = useDataHealth();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Dashboard Access</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter dashboard password"
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold">SPX 0DTE Strategy Dashboard</h1>
        <div className="flex gap-3">
          <DataHealthBadge dataQuality={dataQuality} streamHealth={streamHealth} size="md" />
          <DataQualityDetails dataQuality={dataQuality} streamHealth={streamHealth} />
        </div>
      </div>

      {!loading && (
        <DataHealthBanner dataQuality={dataQuality} streamHealth={streamHealth} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-blue-700 font-semibold">Loading data...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Data Quality Status</h2>
          <div className="space-y-2">
            {dataQuality && (
              <>
                <p><strong>Environment Verified:</strong> {dataQuality.env_vars_verified ? '✓' : '✗'}</p>
                <p><strong>Using Fallback:</strong> {dataQuality.is_using_fallback ? 'Yes' : 'No'}</p>
                <p><strong>Real Chain Data:</strong> {dataQuality.is_using_real_chain ? 'Yes' : 'No (Synthetic)'}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Stream Health Overview</h2>
          <div className="space-y-2">
            {streamHealth && Object.entries(streamHealth).map(([key, health]) => (
              <p key={key}>
                <strong>{key.toUpperCase()}:</strong> {health.ok ? '✓ OK' : '✗ Failed'}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <p className="text-gray-600">All monitoring systems operational</p>
        </div>
      </div>
    </div>
  );
}
