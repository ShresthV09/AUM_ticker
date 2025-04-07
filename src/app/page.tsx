'use client';

import USMarkets from "@/components/USMarkets";
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-2 bg-gray-100">
      <div className="z-10 w-full max-w-6xl">
        {/* Side-by-side layout with more compact spacing */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Left side - USMarkets with compact styling */}
          <div className="w-full lg:w-1/3">
            <div className="overflow-hidden text-xs">
              <style jsx global>{`
                .text-xs .text-lg, .text-xs h2 {
                  font-size: 0.75rem !important;
                  line-height: 1rem !important;
                }
                .text-xs .text-sm {
                  font-size: 0.65rem !important;
                  line-height: 0.9rem !important;
                }
                .text-xs .p-4 {
                  padding: 0.5rem !important;
                }
                .text-xs .mb-3, .text-xs .mb-4 {
                  margin-bottom: 0.5rem !important;
                }
                .text-xs .space-y-3 > * {
                  margin-top: 0.5rem !important;
                  margin-bottom: 0.5rem !important;
                }
                .text-xs .pb-3 {
                  padding-bottom: 0.5rem !important;
                }
                .text-xs .truncate-text {
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
                /* Make stock cards more compact */
                .grid.gap-5 {
                  gap: 0.5rem !important;
                }
                /* Smaller heading */
                .text-xl {
                  font-size: 0.875rem !important;
                  line-height: 1.25rem !important;
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