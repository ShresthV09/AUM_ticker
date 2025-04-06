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

  useEffect(() => {
    const fetchUSData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/us-markets');
        if (!response.ok) {
          throw new Error(`Error fetching US market data: ${response.statusText}`);
        }
        const data = await response.json();
        setUSMarkets(data);
      } catch (error) {
        console.error('Error fetching US market data:', error);
        setError('Failed to load US market data');
      } finally {
        setLoading(false);
      }
    };

    fetchUSData();
    const interval = setInterval(fetchUSData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading US markets data...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">US Stock Markets</h2>
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