import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface MarketIndex {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  lastUpdated: string;
}

interface MarketIndicesResponse {
  data: MarketIndex[];
  failedIndices?: string[];
  timestamp: string;
}

const MarketIndices = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [failedIndices, setFailedIndices] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/market-indices');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data: MarketIndicesResponse = await response.json();
      
      setIndices(data.data);
      setFailedIndices(data.failedIndices || []);
      setLastUpdated(new Date(data.timestamp).toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndices();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchIndices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const isNegative = (value: string) => value.startsWith('-');

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">US Market Indices</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated || 'Never'}
          </span>
          <button 
            onClick={fetchIndices} 
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          Error: {error}
        </div>
      )}

      {failedIndices.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
          Failed to fetch: {failedIndices.join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indices.map((index) => (
          <div key={index.symbol} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{index.name}</h2>
                <p className="text-sm text-gray-500">{index.lastUpdated}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{index.price}</p>
                <div className="flex items-center justify-end gap-2">
                  {isNegative(index.change) ? (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  )}
                  <p className={`font-semibold ${
                    isNegative(index.change) ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {index.change} {index.changePercent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && indices.length === 0 && (
          <div className="col-span-full flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-600">Loading market data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketIndices;