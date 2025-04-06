import { NextResponse } from "next/server";
import { getStockQuote, fallbackCompanyNames } from "@/lib/finnhub";
import { StockData } from "@/types";

// Set cache control headers
const cacheConfig = {
  headers: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
  },
};

// All stocks symbols
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

// Split into two batches to avoid rate limiting
const FIRST_BATCH = ALL_SYMBOLS.slice(0, 4); // First 4 stocks
const SECOND_BATCH = ALL_SYMBOLS.slice(4); // Remaining 4 stocks

// Get a single stock's basic data (fast version)
async function getBasicStockData(symbol: string): Promise<StockData> {
  const quote = await getStockQuote(symbol);
  return {
    symbol,
    companyName: fallbackCompanyNames[symbol] || symbol,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    highDay: quote.h,
    lowDay: quote.l,
    openPrice: quote.o,
    prevClose: quote.pc,
    updateTime: quote.t,
  };
}

// Process a batch of stocks with delay between each request
async function processBatch(
  symbols: string[],
  placeholderData: StockData[]
): Promise<StockData[]> {
  const results: StockData[] = [];

  for (const symbol of symbols) {
    try {
      const data = await getBasicStockData(symbol);
      results.push(data);

      // Add delay between requests (except after the last one)
      if (symbol !== symbols[symbols.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`Error fetching basic data for ${symbol}:`, error);
      const fallback = placeholderData.find((s) => s.symbol === symbol)!;
      results.push(fallback);
    }
  }

  return results;
}

// API handler for fetching stock data in two batches
export async function GET() {
  try {
    // Create placeholder data for all symbols
    const placeholderData = ALL_SYMBOLS.map((symbol) => ({
      symbol,
      companyName: fallbackCompanyNames[symbol] || symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      highDay: 0,
      lowDay: 0,
      openPrice: 0,
      prevClose: 0,
      updateTime: 0,
    }));

    // Process first batch of stocks
    const firstBatchData = await processBatch(FIRST_BATCH, placeholderData);

    // Process second batch after a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const secondBatchData = await processBatch(SECOND_BATCH, placeholderData);

    // Combine results
    const allStocks = [...firstBatchData, ...secondBatchData];

    // Return data with appropriate cache headers
    return NextResponse.json(
      { stocks: allStocks, timestamp: Date.now() },
      cacheConfig
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
