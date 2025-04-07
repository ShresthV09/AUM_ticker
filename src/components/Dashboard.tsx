'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import StockCard from './StockCard';
import { StockData } from '@/types';

// All stocks symbols (same order as API)
const ALL_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA', 'AMZN', 'NVDA', 'AVGO']; // Restored full set
// No longer using batches
// const FIRST_BATCH = ALL_SYMBOLS.slice(0, 4);
// const SECOND_BATCH = ALL_SYMBOLS.slice(4);

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Dashboard() {
  const [loadingMessage, setLoadingMessage] = useState('Loading all stocks...');
  
  // SWR hook for data fetching - no auto refresh
  const { data, error, isLoading, mutate } = useSWR(
    '/api/stocks',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateIfStale: false,
      refreshInterval: 0, // Disable polling
    }
  );

  // Simplified loading message logic
  useEffect(() => {
    if (data?.stocks && data.stocks.length > 0) {
      setLoadingMessage('');
    }
  }, [data]);
  
  // Manual refresh handler
  const handleRefresh = () => {
    setLoadingMessage('Loading all stocks...');
    mutate();
  };
  
  // Format timestamp to readable time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Get available stocks
  const availableStocks = data?.stocks || [];
  
  // Sort stocks alphabetically by symbol
  const sortedStocks = availableStocks.length > 0
    ? [...availableStocks].sort((a, b) => a.symbol.localeCompare(b.symbol))
    : [];
  
  // Determine which stocks are loaded and which are pending
  const loadedSymbols = availableStocks.map((stock: StockData) => stock.symbol);
  const pendingSymbols = ALL_SYMBOLS.filter(symbol => !loadedSymbols.includes(symbol));
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center ">
        <h1 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">US Stock Dashboard</h1>
        
        <div className="flex items-center">
          {loadingMessage && (
            <div className="mr-4 text-sm text-gray-600 animate-pulse">{loadingMessage}</div>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Now'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Failed to load stock data. Please try again.</p>
            </div>
          </div>
        </div>
      )}
      
      {data && (
        <div className="text-sm text-gray-500 mb-6">
          Last updated: {formatTimestamp(data.timestamp)} 
          {pendingSymbols.length > 0 ? ` (Loading ${pendingSymbols.join(", ")}...)` : ''}
        </div>
      )}
      
      {/* Stock Grid */}
      {isLoading && availableStocks.length === 0 ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="h-5 w-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded mb-4"></div>
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 w-10 bg-gray-200 rounded mb-1"></div>
                    <div className="h-5 w-14 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : availableStocks.length > 0 ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {sortedStocks.map((stock: StockData) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
          
          {/* Placeholders for pending stocks */}
          {pendingSymbols.map(symbol => (
            <div key={symbol} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="h-5 w-auto bg-gray-200 px-2 py-1 rounded mb-2 text-xs">
                    {symbol}
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded mb-4"></div>
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-4 w-10 bg-gray-200 rounded mb-1"></div>
                    <div className="h-5 w-14 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}