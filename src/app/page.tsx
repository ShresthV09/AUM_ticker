'use client';

import BSEIndiaData from "../components/BSEIndiaData";
import NSEIndiaData from "../components/NSEIndiaData";
import USMarkets from "@/components/USMarkets";
import Dashboard from '@/components/Dashboard';

export default function Home() {
 
  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-100">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-6">Indian & Global Stock Markets</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
          <div className="flex flex-col">
            <NSEIndiaData />
            <BSEIndiaData />
          </div>
          
          <div className="flex flex-col">
            <USMarkets />
          </div>
        </div>
        
        {/* US Stocks Dashboard */}
        <div className="w-full">
          <Dashboard />
        </div>
       
      </div>
    </main>
  );
}