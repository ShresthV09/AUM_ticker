import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BSEIndexData } from '@/types';

export default function BSEIndiaData() {
  const [bseData, setBseData] = useState<BSEIndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBSEData = async () => {
      try {
        setLoading(true);
        
        // Create a server-side API route to handle the web scraping
        const response = await axios.get('/api/bse-data');
        console.log('API Response:', response.data);
        
        if (response.data && response.data.length > 0) {
          setBseData(response.data);
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

    fetchBSEData();
    
    // Refresh data every minute
    const intervalId = setInterval(fetchBSEData, 60000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading && bseData.length === 0) {
    return <div className="text-sm text-gray-500">Loading BSE markets data...</div>;
  }

  if (error && bseData.length === 0) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">BSE India Indices</h2>
      <div className="space-y-2">
        {bseData.map((market, index) => (
          <div key={index} className="flex justify-between border-b pb-2">
            <div className="font-medium">{market.indexName}</div>
            <div className="flex flex-col items-end">
              <div className="font-semibold">
                {market.currentValue.toLocaleString('en-IN')}
              </div>
              <div className="flex space-x-2 text-sm">
                <span className={market.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                </span>
                <span className={market.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {market.changePercent >= 0 ? '+' : ''}
                  {typeof market.changePoints !== 'undefined' 
                    ? market.changePoints.toLocaleString('en-IN')
                    : ((market.currentValue - market.prevClose) || 0).toFixed(2)
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 