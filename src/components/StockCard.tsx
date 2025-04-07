import React from 'react';
import { StockData } from '@/types';

interface StockCardProps {
  stock: StockData;
}

export default function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0;
  
  // Format price with 2 decimal places
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Calculate percentage down from ATH
  const calculatePercentFromATH = () => {
    if (!stock.allTimeHigh) return null;
    const percentDown = ((stock.allTimeHigh - stock.price) / stock.allTimeHigh) * 100;
    return percentDown.toFixed(2);
  };

  const percentFromATH = calculatePercentFromATH();

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.companyName}</p>
        </div>
        <div className='flex flex-col'>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
        </div>
        {percentFromATH && (
        <div className="mt-2">

          <div className="text-sm  flex flex-row">
            <span className="font-medium text-xs">▼ ATH- </span>
           <p className='text-xs text-red-600'> {percentFromATH}%</p>
          </div>
        </div>
      )}
      </div>
      </div>
     
      <div className="flex items-end">
        <p className="text-2xl font-bold">${formatPrice(stock.price)}</p>
        <p className={`ml-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{formatPrice(stock.change)}
        </p>
      </div>
      

      
      
      
      <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-gray-500">High</p>
          <p className="font-medium">${formatPrice(stock.highDay)}</p>
        </div>
        <div>
          <p className="text-gray-500">Low</p>
          <p className="font-medium">${formatPrice(stock.lowDay)}</p>
        </div>
        <div>
          <p className="text-gray-500">Open</p>
          <p className="font-medium">${formatPrice(stock.openPrice)}</p>
        </div>
        <div>
          <p className="text-gray-500">Prev Close</p>
          <p className="font-medium">${formatPrice(stock.prevClose)}</p>
        </div>
      </div>
    </div>
  );
}