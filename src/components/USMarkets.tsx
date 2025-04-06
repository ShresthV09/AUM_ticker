import { useEffect, useState } from 'react';

interface USMarketData {
  indexName: string;
  symbol: string;
  currentValue: number;
  changePercent: number;
  changePoints: number;
}

const USMarkets = () => {
  const [usMarkets, setUSMarkets] = useState<USMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchUSData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/us-markets');
      if (!response.ok) {
        throw new Error(`Error fetching US market data: ${response.statusText}`);
      }
      const data = await response.json();
      setUSMarkets(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching US market data:', error);
      setError('Failed to load US market data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only on component mount
  useEffect(() => {
    fetchUSData();
    // No interval refresh
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchUSData();
  };

  if (loading && !usMarkets.length) {
    return <div className="text-sm text-gray-500">Loading US markets data...</div>;
  }

  if (error && !usMarkets.length) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">US Stock Markets</h2>
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
        {usMarkets.map((market) => (
          <div key={market.symbol} className="flex justify-between border-b pb-2">
            <div className="font-medium">{market.indexName}</div>
            <div className="flex flex-col items-end">
              <div className="font-semibold">
                {market.currentValue.toLocaleString()}
              </div>
              <div className="flex space-x-2 text-sm">
                <span className={market.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                </span>
                <span className={market.changePoints >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {market.changePoints >= 0 ? '+' : ''}{market.changePoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default USMarkets; 