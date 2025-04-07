import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Define the structure for US market data
interface USMarketData {
  indexName: string;
  symbol: string;
  currentValue: number;
  changePercent: number;
  changePoints: number;
}

// Define the US indices to track
const US_INDICES = [
  { id: "VIX", name: "VIX", exchange: "INDEXCBOE" },
  { id: ".INX", name: "S&P 500", exchange: "INDEXSP" },
  { id: ".IXIC", name: "NASDAQ", exchange: "INDEXNASDAQ" },
  { id: ".DJI", name: "Dow Jones", exchange: "INDEXDJX" },
];

export async function GET() {
  try {
    // Use browser-like headers to avoid blocks
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    // Initialize the US markets data array
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

        // 1. Get the price (YMlKec fxKbKc class)
        const priceText = $(".YMlKec.fxKbKc").first().text().trim();
        const price = parseFloat(priceText.replace(/,/g, "")) || 0;
        console.log(`Price: ${price} (from "${priceText}")`);

        // 2. Get the percentage change
        // Use a more specific selector to target only the first JwB6zf element
        const percentText = $("div.JwB6zf").first().text().trim();
        let changePercent = 0;

        if (percentText) {
          // Extract the percentage value
          const match = percentText.match(/([-+]?\d+\.?\d*)%/);
          if (match && match[1]) {
            changePercent = parseFloat(match[1]);
            // Check for negative indicators
            if (
              percentText.includes("↓") ||
              $("div.JwB6zf").first().closest("span.VOXKNe").length > 0
            ) {
              changePercent = -Math.abs(changePercent);
            }
          }
        }

        console.log(
          `Percent Change: ${changePercent}% (from "${percentText}")`
        );

        // 3. Get the change points
        // Try to get the exact element
        const changeText = $("span.P2Luy").first().text().trim();
        let changePoints = 0;

        if (changeText) {
          // Format is typically "-345.65 Today" or "+123.45 Today"
          const match = changeText.match(/([-+]?[\d,.]+)/);
          if (match && match[1]) {
            changePoints = parseFloat(match[1].replace(/,/g, ""));
            // Ensure sign matches percentage change
            if (
              (changePercent < 0 && changePoints > 0) ||
              (changePercent > 0 && changePoints < 0)
            ) {
              changePoints = -changePoints;
            }
          }
        }

        console.log(`Change Points: ${changePoints} (from "${changeText}")`);

        // Create US market data object
        const indexData: USMarketData = {
          indexName: index.name,
          symbol: index.id,
          currentValue: price,
          changePercent: changePercent,
          changePoints: changePoints,
        };

        // Add to our US market data array
        usMarketData.push(indexData);
        console.log(`Successfully processed data for ${index.name}: ${price}`);
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Add placeholder data on error
        usMarketData.push({
          indexName: index.name,
          symbol: index.id,
          currentValue: 0,
          changePercent: 0,
          changePoints: 0,
        });
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
