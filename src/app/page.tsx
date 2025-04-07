'use client';

import USMarkets from "@/components/USMarkets";
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-2 bg-gray-900">
      <div className="z-10 w-full max-w-6xl">
        {/* Side-by-side layout with more compact spacing */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Left side - USMarkets with compact styling */}
          <div className="w-full lg:w-1/3">
            <div className="overflow-hidden text-xs">
              <style jsx global>{`
                /* Force proper contrast for dark theme */
                .bg-white {
                  background-color: #1e293b !important; /* dark blue-gray */
                  color: #e2e8f0 !important;
                }
                .text-gray-500 {
                  color: #94a3b8 !important; /* lighter blue-gray */
                }
                .text-gray-900, .text-gray-600, .font-medium, .font-semibold, .font-bold, h1, h2 {
                  color: #f1f5f9 !important;
                }
                .border-b {
                  border-color: #475569 !important;
                }
                .text-lg, .text-xs h2 {
                  font-size: 0.75rem !important;
                  line-height: 1rem !important;
                }
                .text-sm {
                  font-size: 0.65rem !important;
                  line-height: 0.9rem !important;
                }
                .p-4 {
                  padding: 0.5rem !important;
                }
                .mb-3, .mb-4 {
                  margin-bottom: 0.5rem !important;
                }
                .shadow {
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
                }
                .space-y-3 > * {
                  margin-top: 0.5rem !important;
                  margin-bottom: 0.5rem !important;
                }
                .pb-3 {
                  padding-bottom: 0.5rem !important;
                }
                button.bg-gray-200 {
                  background-color: #334155 !important;
                  color: #e2e8f0 !important;
                }
                button.bg-gray-200:hover {
                  background-color: #475569 !important;
                }
                .truncate-text {
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              `}</style>
              <USMarkets />
            </div>
          </div>
          
          {/* Right side - Dashboard with compact styling */}
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden text-xs">
              <style jsx global>{`
                /* Dark theme for stock cards */
                .bg-white.rounded-lg {
                  background-color: #1e293b !important;
                  color: #e2e8f0 !important;
                }
                .bg-gray-200 {
                  background-color: #334155 !important;
                }
                .text-gray-900 {
                  color: #f1f5f9 !important;
                }
                /* Make stock cards more compact */
                .grid.gap-5 {
                  gap: 0.5rem !important;
                }
                /* Smaller heading */
                .text-xl {
                  font-size: 0.875rem !important;
                  line-height: 1.25rem !important;
                }
                /* Button styling */
                .bg-indigo-600 {
                  background-color: #4f46e5 !important;
                }
                .bg-indigo-600:hover {
                  background-color: #4338ca !important;
                }
                /* Smaller buttons */
                .px-4.py-2 {
                  padding: 0.25rem 0.5rem !important;
                }
                /* Shrink card padding */
                .p-5 {
                  padding: 0.5rem !important;
                }
                /* Fix grid for more cards per row */
                @media (min-width: 768px) {
                  .md\\:grid-cols-4 {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                  }
                }
                @media (min-width: 1024px) {
                  .lg\\:grid-cols-4 {
                    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                  }
                }
              `}</style>
              <Dashboard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}