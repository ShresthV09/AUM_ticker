'use client';

import USMarkets from "@/components/USMarkets";
import CryptoMarkets from "@/components/CryptoMarkets";
import Dashboard from '@/components/Dashboard';
import Futures from "@/components/Futures";

export default function Home() {
  return (
    <>
      {/* Aggressive CSS reset to force consistent styling */}
      <style jsx global>{`
        /* Force light theme regardless of browser/system settings */
        :root {
          color-scheme: light only !important;
        }
        
        /* Reset all potentially problematic elements */
        body, div, main, section, article, aside, header, footer, nav, h1, h2, h3, h4, h5, h6, p, span, a, button {
          color: #000000 !important;
          background-color: transparent !important;
          border-color: #e5e7eb !important;
        }
        
        /* Force bg-white to actually be white */
        .bg-white, [class*="bg-white"] {
          background-color: #ffffff !important;
        }
        
        /* Force bg-gray-100 to be consistent */
        .bg-gray-100, [class*="bg-gray-100"] {
          background-color: #f3f4f6 !important;
        }
        
        /* Force text colors to be visible and consistent */
        .text-gray-500, [class*="text-gray-500"] {
          color: #6b7280 !important;
        }
        
        .text-gray-600, [class*="text-gray-600"] {
          color: #4b5563 !important;
        }
        
        .text-green-600, [class*="text-green-600"] {
          color: #059669 !important;
        }
        
        .text-red-600, [class*="text-red-600"] {
          color: #dc2626 !important;
        }
        
        /* Size adjustments */
        .text-lg, [class*="text-lg"] {
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }
        
        .text-sm, [class*="text-sm"] {
          font-size: 0.65rem !important;
          line-height: 0.9rem !important;
        }
        
        .text-xl, [class*="text-xl"] {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }
        
        .text-2xl, [class*="text-2xl"] {
          font-size: 1.125rem !important;
          line-height: 1.5rem !important;
        }
        
        /* Spacing adjustments */
        .p-4, [class*="p-4"] {
          padding: 0.5rem !important;
        }
        
        .p-5, [class*="p-5"] {
          padding: 0.5rem !important;
        }
        
        .mb-3, .mb-4, [class*="mb-3"], [class*="mb-4"] {
          margin-bottom: 0.5rem !important;
        }
        
        .gap-5, [class*="gap-5"] {
          gap: 0.5rem !important;
        }
        
        /* Fix specific styling elements */
        .bg-indigo-600, [class*="bg-indigo-600"] {
          background-color: #4f46e5 !important;
          color: white !important;
        }
        
        .bg-indigo-600 *, [class*="bg-indigo-600"] * {
          color: white !important;
        }
        
        .bg-green-100, [class*="bg-green-100"] {
          background-color: #d1fae5 !important;
        }
        
        .bg-red-100, [class*="bg-red-100"] {
          background-color: #fee2e2 !important;
        }
        
        .text-green-800, [class*="text-green-800"] {
          color: #065f46 !important;
        }
        
        .text-red-800, [class*="text-red-800"] {
          color: #991b1b !important;
        }
        
        /* Explicit responsive layout rules */
        #layout-container {
          display: flex;
          flex-direction: row !important; /* Force row layout on all screens */
          gap: 0.5rem;
        }
        
        #markets-container {
          width: 30% !important; /* Left column takes 30% */
        }
        
        #dashboard-container {
          width: 70% !important; /* Right column takes 70% */
        }
      `}</style>
      
      {/* Main content with inline styles for guaranteed consistency */}
      <main style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.5rem',
        backgroundColor: '#f3f4f6',
      }}>
        <div style={{
          zIndex: 10,
          width: '100%',
          maxWidth: '72rem',
        }}>
          {/* Custom AUM header with inline styles */}
          <div style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#4338ca',
            color: 'white',
            marginBottom: '0.5rem',
          }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white !important',
            }}>AUM</h1>
          </div>
          
          {/* Always side-by-side layout with fixed widths */}
          <div id="layout-container">
            {/* Left side - USMarkets and CryptoMarkets */}
            <div id="markets-container" style={{
              fontSize: '0.75rem',
              overflow: 'hidden',
            }}>
              <USMarkets />
              <h1 className="text-2xl font-bold">Futures</h1>
              <Futures />
            
            </div>
            
            {/* Right side - Dashboard */}
            <div id="dashboard-container" className="flex flex-col" style={{
              fontSize: '0.75rem',
              overflow: 'hidden',
            }}>
              <Dashboard />
              <CryptoMarkets />
         
            </div>
          </div>
        </div>
      </main>
    </>
  );
}