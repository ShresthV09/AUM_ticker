import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Enhanced market data interface with previous close and all-time high
interface indicesAsia {
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

    const ASIAN_INDICES = [
      {
        id: "NI225",
        name: "Nikkei 225",
        exchange: "INDEXNIKKEI",
        previousClose: 31136.58,
        allTimeHigh: 42426,
      },
      {
        id: "000001",
        name: "SSE Composite",
        exchange: "SHA",
        previousClose: 3096.58,
        allTimeHigh: 6124,
      },
      {
        id: "HSI",
        name: "Hang Seng",
        exchange: "INDEXHANGSENG",
        previousClose: 19828.3,
        allTimeHigh: 33484,
      },
    ];

    const indicesAsia: indicesAsia[] = [];

    for (const index of ASIAN_INDICES) {
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

        // Create Asian market data object
        const indexData: indicesAsia = {
          indexName: index.name,
          symbol: index.id,
          currentValue: currentPrice,
          previousClose: index.previousClose,
          allTimeHigh: index.allTimeHigh,
          percentFromATH: Math.round(percentFromATH * 100) / 100, // Round to 2 decimal places
        };

        // Add to our Asian market data array
        indicesAsia.push(indexData);
        console.log(
          `Successfully processed data for ${index.name}: ${currentPrice}`
        );
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Add data with just previous close on error
        indicesAsia.push({
          indexName: index.name,
          symbol: index.id,
          currentValue: index.previousClose, // Use previous close as fallback
          previousClose: index.previousClose,
          allTimeHigh: index.allTimeHigh,
          percentFromATH: 0,
        });
      }
    }

    console.log(`Returning data for ${indicesAsia.length} Asian indices`);

    // Return the parsed data
    return NextResponse.json(indicesAsia);
  } catch (error) {
    console.error(
      "Error fetching Asian market data from Google Finance:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch Asian market data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
