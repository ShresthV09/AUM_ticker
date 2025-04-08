/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

interface USMarketData {
  indexName: string;
  symbol: string;
  currentValue: number;
  previousClose: number;
  allTimeHigh: number;
  percentFromATH: number;
}

const USMarkets = () => {
  const [usMarkets, setUSMarkets] = useState<USMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchUSData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/futures');
      if (!response.ok) {
        throw new Error(`Error fetching US market data: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Validate the data to ensure it has the expected format
      const validData = data.filter((item: any) => 
        item && typeof item.currentValue === 'number'
      );
      
      setUSMarkets(validData);
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

  // Calculate daily change
  const getDailyChange = (current: number, prev: number) => {
    const change = current - prev;
    const percentChange = (change / prev) * 100;
    return {
      change: Math.round(change * 100) / 100,
      percentChange: Math.round(percentChange * 100) / 100
    };
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
      
      <div className="space-y-3">
        {usMarkets.map((market) => {
          const dailyChange = getDailyChange(market.currentValue, market.previousClose);
          const isPositive = dailyChange.change > 0;
          
          return (
            <div key={market.symbol} className="border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{market.indexName}</div>
                  <div className="text-xs text-gray-500">Previous close: {market.previousClose.toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="font-bold text-lg">
                    {market.currentValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{dailyChange.change.toLocaleString()} ({isPositive ? '+' : ''}{dailyChange.percentChange}%)
                  </div>
                </div>
              </div>
              
              <div className="mt-1 text-xs flex justify-between">
                <span>All-Time High: {market.allTimeHigh.toLocaleString()}</span>
                <span className="text-amber-600">
                  {market.percentFromATH > 0 ? 
                    `${market.percentFromATH.toFixed(2)}% below ATH` : 
                    'At All-Time High'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default USMarkets;