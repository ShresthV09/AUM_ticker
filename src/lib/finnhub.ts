import axios from "axios";
import { StockQuote, CompanyProfile, StockData } from "@/types";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
console.log(FINNHUB_API_KEY);
const BASE_URL = "https://finnhub.io/api/v1";

// Create axios instance with API key
const finnhubClient = axios.create({
  baseURL: BASE_URL,
  params: {
    token: FINNHUB_API_KEY,
  },
});

// Function to fetch stock quote from Finnhub
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const response = await finnhubClient.get<StockQuote>("/quote", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
}

// Function to fetch company profile from Finnhub
export async function getCompanyProfile(
  symbol: string
): Promise<CompanyProfile> {
  try {
    const response = await finnhubClient.get<CompanyProfile>(
      "/stock/profile2",
      {
        params: { symbol },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    throw new Error(`Failed to fetch company profile for ${symbol}`);
  }
}

// Batch function to get full stock data (quote + company name)
export async function getFullStockData(symbol: string): Promise<StockData> {
  try {
    const [quote, profile] = await Promise.all([
      getStockQuote(symbol),
      getCompanyProfile(symbol),
    ]);

    return {
      symbol,
      companyName: profile.name,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      highDay: quote.h,
      lowDay: quote.l,
      openPrice: quote.o,
      prevClose: quote.pc,
      updateTime: quote.t,
    };
  } catch (error) {
    console.error(`Error fetching full data for ${symbol}:`, error);
    throw new Error(`Failed to fetch full data for ${symbol}`);
  }
}

// Company name mapping in case the API fails
export const fallbackCompanyNames: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  AMZN: "Amazon.com Inc.",
  NVDA: "NVIDIA Corporation",
  GOOGL: "Alphabet Inc.",
  META: "Meta Platforms Inc.",
  TSLA: "Tesla Inc.",
  AVGO: "Broadcom Inc.",
};

// Process a single stock with built-in error handling
async function processStockRequest(symbol: string): Promise<StockData> {
  try {
    return await getFullStockData(symbol);
  } catch {
    console.error(`Falling back to basic data for ${symbol}`);
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
}

// Queue processor with delay between requests
async function processQueue<T>(
  items: string[],
  processFn: (item: string) => Promise<T>,
  delayMs: number = 200
): Promise<T[]> {
  const results: T[] = [];

  for (const item of items) {
    try {
      // Process one item
      const result = await processFn(item);
      results.push(result);

      // Add delay between requests (except after the last one)
      if (item !== items[items.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch {
      console.error(`Error processing item ${item}`);
    }
  }

  return results;
}

// Get multiple stocks data sequentially to respect rate limits
export async function getBatchStockData(
  symbols: string[]
): Promise<StockData[]> {
  try {
    // Process stock requests sequentially with 200ms delay between each
    return await processQueue(symbols, processStockRequest, 200);
  } catch (error) {
    console.error("Error fetching batch stock data:", error);
    throw new Error("Failed to fetch batch stock data");
  }
}

// BATMMAAN stocks
export const BATMMAAN_SYMBOLS = [
  "BBG",
  "AAPL",
  "TSLA",
  "MSFT",
  "META",
  "AMZN",
  "GOOGL",
  "NVDA",
];
