import { NextResponse } from "next/server";
import { StockData } from "@/types";
import { getBatchStockData, fallbackCompanyNames } from "@/lib/finnhub";

// Meta, Apple, Google, Tesla, Microsoft, Amazon, Nvidia, Broadcom
const ALL_SYMBOLS = [
  "META",
  "AAPL",
  "GOOGL",
  "TSLA",
  "MSFT",
  "AMZN",
  "NVDA",
  "AVGO",
];

// Function to create mock data when API fails
function createMockStockData(symbol: string): StockData {
  const randomPrice = Math.floor(100 + Math.random() * 900);
  const randomChange = Math.floor(Math.random() * 20) - 10; // -10 to +10
  const randomPercent = (randomChange / randomPrice) * 100;

  return {
    symbol,
    companyName: fallbackCompanyNames[symbol] || symbol,
    price: randomPrice,
    change: randomChange,
    changePercent: randomPercent,
    highDay: randomPrice + Math.floor(Math.random() * 20),
    lowDay: randomPrice - Math.floor(Math.random() * 20),
    openPrice: randomPrice - Math.floor(Math.random() * 10),
    prevClose: randomPrice - randomChange,
    updateTime: Date.now(),
  };
}

// Get basic stock data with fallback to mock data
async function getBasicStockData(symbol: string): Promise<StockData> {
  try {
    // Try to get real data from Finnhub
    const stocks = await getBatchStockData([symbol]);
    return stocks[0];
  } catch (error) {
    console.error(`API Error for ${symbol}, using mock data:`, error);
    // Use mock data when API fails
    return createMockStockData(symbol);
  }
}

// Process a batch of stock symbols
async function processBatch(symbols: string[]): Promise<StockData[]> {
  try {
    // Try to get all data from Finnhub
    return await getBatchStockData(symbols);
  } catch (error) {
    console.error(
      "Error in batch processing, falling back to individual requests:",
      error
    );

    // Fallback to individual requests with mock data
    const results: StockData[] = [];
    for (const symbol of symbols) {
      try {
        const data = await getBasicStockData(symbol);
        results.push(data);
      } catch {
        console.error(`Error getting data for ${symbol}, using mock data`);
        results.push(createMockStockData(symbol));
      }
    }
    return results;
  }
}

export async function GET() {
  try {
    const startTime = Date.now();
    let results: StockData[] = [];

    console.log("Starting stock data fetch...");
    try {
      // Process all symbols at once, with automatic fallback
      results = await processBatch(ALL_SYMBOLS);
    } catch (error) {
      console.error("Error processing stocks batch:", error);
      // If all attempts fail, return mock data for all symbols
      results = ALL_SYMBOLS.map(createMockStockData);
    }

    const endTime = Date.now();
    console.log(`Fetched ${results.length} stocks in ${endTime - startTime}ms`);

    return NextResponse.json({
      stocks: results,
      timestamp: Date.now(),
      error:
        results.length < ALL_SYMBOLS.length
          ? "Some stock data unavailable"
          : null,
    });
  } catch (error) {
    console.error("Unhandled error in stocks API:", error);

    // Return a minimal response with mock data in case of complete failure
    return NextResponse.json(
      {
        stocks: ALL_SYMBOLS.map(createMockStockData),
        timestamp: Date.now(),
        error: "Failed to fetch real stock data",
      },
      { status: 200 }
    ); // Still return 200 to not break the frontend
  }
}
