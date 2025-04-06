import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BATMMAAN Stocks Dashboard',
  description: 'Real-time dashboard for tracking BATMMAAN stocks using Finnhub API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <header className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-white font-bold text-lg">BATMMAAN Stocks</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        {children}
        <footer className="bg-gray-800 text-white py-4 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            <p>Powered by Finnhub API | Data refreshes automatically</p>
          </div>
        </footer>
      </body>
    </html>
  );
}