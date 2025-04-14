import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Enhanced market data interface with previous close and all-time high
interface USMarketData {
  indexName: string;
  symbol: string;
  currentValue: number;
  previousClose: number;
  allTimeHigh: number;
  percentFromATH: number;
}

export async function GET() {
  try {
    // Browser-like headers to avoid being blocked
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html",
    };

    // Define indices with their previous close values and all-time highs
    const US_INDICES = [
      {
        id: "NQW00",
        name: "NASDAQ Futures",
        exchange: "CME_EMINIS",
        allTimeHigh: 22319,
      },
      {
        id: "YMW00",
        name: "Dow Futures",
        exchange: "CBOT",
        allTimeHigh: 44706,
      },
      {
        id: "ESW00",
        name: "S&P Futures",
        exchange: "CME_EMINIS",
        allTimeHigh: 6067,
      },
    ];

    // Array to store US market data
    const usMarketData: USMarketData[] = [];

    // Process each US market index
    for (const index of US_INDICES) {
      try {
        console.log(`Fetching data for ${index.name} (${index.id})...`);

        // Using the exact Google Finance URL format
        const url = `https://www.google.com/finance/quote/${index.id}:${index.exchange}`;
        console.log(`URL: ${url}`);

        const response = await axios.get(url, {
          headers,
          timeout: 10000,
        });

        // Parse the HTML response using cheerio
        const $ = cheerio.load(response.data);

        // FOCUS ONLY ON PRICE - Multiple attempts to get the price using different selectors
        let currentPrice = 0;

        // Attempt 1: Main price selector
        const priceElement = $(".YMlKec.fxKbKc").first();
        if (priceElement.length > 0) {
          const priceText = priceElement.text().trim();
          currentPrice = parseFloat(priceText.replace(/,/g, "")) || 0;
        }

        // Attempt 2: Try with exact nesting path if first attempt failed
        if (currentPrice === 0) {
          const nestedPriceElement = $(".rPF6Lc .ln0Gqe .AHmHk .YMlKec.fxKbKc");
          if (nestedPriceElement.length > 0) {
            const priceText = nestedPriceElement.first().text().trim();
            currentPrice = parseFloat(priceText.replace(/,/g, "")) || 0;
          }
        }

        // Attempt 3: Try with data attribute if previous attempts failed
        if (currentPrice === 0) {
          const dataElement = $("[data-last-price]");
          if (dataElement.length > 0) {
            const priceAttr = dataElement.attr("data-last-price");
            if (priceAttr) {
              currentPrice = parseFloat(priceAttr) || 0;
            }
          }
        }

        // Get previous close value
        let previousClose = 0;

        // Find the div containing "Previous close" text
        const prevCloseRow = $(".gyFHrc").filter(function () {
          return $(this).find(".mfs7Fc").text().trim() === "Previous close";
        });

        if (prevCloseRow.length > 0) {
          const prevCloseText = prevCloseRow.find(".P6K39c").text().trim();
          // Remove currency symbols and commas, then parse as float
          previousClose = parseFloat(prevCloseText.replace(/[$,]/g, "")) || 0;
          console.log(
            `Found previous close for ${index.name}: ${previousClose}`
          );
        }

        // If we couldn't get current price or previous close, throw error
        if (currentPrice === 0) {
          throw new Error(`Failed to get current price for ${index.name}`);
        }

        if (previousClose === 0) {
          throw new Error(`Failed to get previous close for ${index.name}`);
        }

        // Calculate percentage from all-time high
        const percentFromATH =
          ((index.allTimeHigh - currentPrice) / index.allTimeHigh) * 100;

        // Create US market data object
        const indexData: USMarketData = {
          indexName: index.name,
          symbol: index.id,
          currentValue: currentPrice,
          previousClose: previousClose,
          allTimeHigh: index.allTimeHigh,
          percentFromATH: Math.round(percentFromATH * 100) / 100, // Round to 2 decimal places
        };

        // Add to our US market data array
        usMarketData.push(indexData);
        console.log(
          `Successfully processed data for ${index.name}: ${currentPrice} (prev close: ${previousClose})`
        );
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Instead of using fallback, propagate the error
        throw new Error(
          `Failed to fetch data for ${index.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    console.log(`Returning data for ${usMarketData.length} US indices`);

    // Return the parsed data
    return NextResponse.json(usMarketData);
  } catch (error) {
    console.error("Error fetching US market data from Google Finance:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch US market data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
