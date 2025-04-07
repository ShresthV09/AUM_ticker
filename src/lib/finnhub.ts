import axios from "axios";
import { StockQuote, CompanyProfile, StockData } from "@/types";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
console.log(
  "API Key length:",
  FINNHUB_API_KEY ? FINNHUB_API_KEY.length : 0,
  "API Key present:",
  !!FINNHUB_API_KEY
);
const BASE_URL = "https://finnhub.io/api/v1";

// Create axios instance with API key
const finnhubClient = axios.create({
  baseURL: BASE_URL,
  params: {
    token: FINNHUB_API_KEY,
  },
});

// Add request interceptor for logging
finnhubClient.interceptors.request.use((request) => {
  console.log("Starting Request to Finnhub:", request.url, "with params:", {
    ...request.params,
    token: request.params.token ? "***PRESENT***" : "***MISSING***",
  });
  return request;
});

// Add response interceptor for logging
finnhubClient.interceptors.response.use(
  (response) => {
    console.log("Response from Finnhub:", response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error(
      "Finnhub API Error:",
      error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }
        : error.message
    );
    return Promise.reject(error);
  }
);

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

    // Static ATH data for each stock
    const allTimeHighs: Record<string, number> = {
      GOOGL: 208.7,
      AVGO: 252,
      AAPL: 260,
      TSLA: 489,
      META: 719,
      MSFT: 468,
      AMZN: 236,
      NVDA: 153,
    };

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
      allTimeHigh: allTimeHighs[symbol],
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

// Get multiple stocks data sequentially to respect rate limits
export async function getBatchStockData(
  symbols: string[]
): Promise<StockData[]> {
  try {
    console.log(`Starting to fetch ${symbols.length} stocks sequentially...`);
    const results: StockData[] = [];

    // Process each symbol one by one with a delay between requests
    for (const symbol of symbols) {
      try {
        console.log(`Processing stock: ${symbol}`);
        // Try to get full data (quote + profile)
        const data = await getFullStockData(symbol);
        results.push(data);
        console.log(`Successfully fetched data for ${symbol}`);

        // Add delay between requests (except after the last one)
        if (symbol !== symbols[symbols.length - 1]) {
          console.log(`Adding delay before next request...`);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error processing ${symbol}, trying fallback:`, error);
        // Try fallback to just quote with fallback company name
        try {
          const quote = await getStockQuote(symbol);

          // Static ATH data for each stock
          const allTimeHighs: Record<string, number> = {
            GOOGL: 208.7,
            AVGO: 252,
            AAPL: 260,
            TSLA: 489,
            META: 719,
            MSFT: 468,
            AMZN: 236,
            NVDA: 153,
          };

          results.push({
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
            allTimeHigh: allTimeHighs[symbol],
          });
          console.log(`Used fallback data for ${symbol}`);
        } catch (fallbackError) {
          console.error(`Complete failure for ${symbol}:`, fallbackError);
          // Don't add to results if we can't get any data
        }
      }
    }

    console.log(
      `Completed fetching ${results.length}/${symbols.length} stocks`
    );
    return results;
  } catch (error) {
    console.error("Error in batch stock data processing:", error);
    throw new Error("Failed to fetch batch stock data");
  }
}

// BATMMAAN stocks (removed Bloomberg/BBG)
export const BATMMAAN_SYMBOLS = [
  "AAPL",
  "TSLA",
  "MSFT",
  "META",
  "AMZN",
  "GOOGL",
  "NVDA",
];
