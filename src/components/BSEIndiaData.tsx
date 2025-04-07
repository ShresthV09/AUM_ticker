import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BSEIndexData } from '@/types';

export default function BSEIndiaData() {
  const [bseData, setBseData] = useState<BSEIndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchBSEData = async () => {
    try {
      setLoading(true);
      
      // Create a server-side API route to handle the web scraping
      const response = await axios.get('/api/bse-data');
      console.log('API Response:', response.data);
      
      if (response.data && response.data.length > 0) {
        setBseData(response.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError('No data available');
      }
    } catch (err) {
      console.error('Error fetching BSE data:', err);
      setError('Failed to fetch BSE data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only on component mount
  useEffect(() => {
    fetchBSEData();
    // No interval refresh
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchBSEData();
  };

  if (loading && bseData.length === 0) {
    return <div className="text-sm text-gray-500">Loading BSE markets data...</div>;
  }

  if (error && bseData.length === 0) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">BSE India Indices</h2>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">
            {lastUpdated ? `Last updated: ${lastUpdated}` : ''}
          </span>
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {bseData.map((market, index) => (
          <div key={index} className="flex justify-between border-b pb-2">
            <div className="font-medium">{market.indexName}</div>
            <div className="flex flex-col items-end">
              <div className="font-semibold">
                {market.currentValue.toLocaleString('en-IN')}
              </div>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 