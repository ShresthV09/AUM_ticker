import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Enhanced market data interface with previous close and all-time high
interface indicesEurope {
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

    const EU_INDICES = [
      {
        id: "UKX",
        name: "FTSE 100",
        exchange: "INDEXFTSE",
        previousClose: 7702.08,
        allTimeHigh: 8742.75,
      },
      {
        id: "PX1",
        name: "CAC 40",
        exchange: "INDEXEURO",
        previousClose: 6927.12,
        allTimeHigh: 8260,
      },
      {
        id: "DAX",
        name: "DAX",
        exchange: "INDEXDB",
        previousClose: 19789.62,
        allTimeHigh: 23476.01,
      },
    ];

    const indicesEurope: indicesEurope[] = [];

    for (const index of EU_INDICES) {
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

        // If still no price, use previous close as fallback
        if (currentPrice === 0) {
          currentPrice = index.previousClose;
          console.log(
            `Warning: Using previous close as fallback for ${index.name}`
          );
        }

        // Calculate percentage from all-time high
        const percentFromATH =
          ((index.allTimeHigh - currentPrice) / index.allTimeHigh) * 100;

        // Create US market data object
        const indexData: indicesEurope = {
          indexName: index.name,
          symbol: index.id,
          currentValue: currentPrice,
          previousClose: index.previousClose,
          allTimeHigh: index.allTimeHigh,
          percentFromATH: Math.round(percentFromATH * 100) / 100, // Round to 2 decimal places
        };

        // Add to our US market data array
        indicesEurope.push(indexData);
        console.log(
          `Successfully processed data for ${index.name}: ${currentPrice}`
        );
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Add data with just previous close on error
        indicesEurope.push({
          indexName: index.name,
          symbol: index.id,
          currentValue: index.previousClose, // Use previous close as fallback
          previousClose: index.previousClose,
          allTimeHigh: index.allTimeHigh,
          percentFromATH: 0,
        });
      }
    }

    console.log(`Returning data for ${indicesEurope.length} US indices`);

    // Return the parsed data
    return NextResponse.json(indicesEurope);
  } catch (error) {
    console.error("Error fetching EU market data from Google Finance:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch US market data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
