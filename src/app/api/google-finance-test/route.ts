import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import console from "console";

// Define the structure for Google Finance data
interface GoogleFinanceResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  [key: string]: unknown; // Using unknown instead of any
}

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

    // Define the indices we want to track with their exact Google Finance URLs
    const indices = [
      { id: "NIFTY_50", name: "NIFTY 50", exchange: "INDEXNSE" },
      { id: "SENSEX", name: "BSE SENSEX", exchange: "INDEXBOM" },
      { id: "INDIA_VIX", name: "INDIA VIX", exchange: "INDEXNSE" },
      { id: "BSE-SMLCAP", name: "BSE SMALLCAP", exchange: "INDEXBOM" },
      { id: "NIFTY_NEXT_50", name: "NIFTY NEXT 50", exchange: "INDEXNSE" },
      { id: "BSE-500", name: "BSE 500", exchange: "INDEXBOM" },
    ];

    // Array to hold the results
    const results: GoogleFinanceResult[] = [];

    // Process each index
    for (const index of indices) {
      try {
        // Using the exact Google Finance URL format
        const url = `https://www.google.com/finance/quote/${index.id}:${index.exchange}`;
        console.log(`Fetching data from: ${url}`);

        const response = await axios.get(url, { headers, timeout: 10000 });

        // Parse the HTML response using cheerio
        const $ = cheerio.load(response.data);

        console.log(`Extracting data for ${index.name} with exact selectors`);

        // 1. Get the price (YMlKec fxKbKc class)
        const priceText = $(".YMlKec.fxKbKc").first().text().trim();
        const price = parseFloat(priceText.replace(/,/g, "")) || 0;
        console.log(`Price: ${price} (from "${priceText}")`);

        // 2. Get the percentage change (inside JwB6zf div)
        const percentText = $(".JwB6zf").text().trim();
        let changePercent = 0;

        // Parse the percentage text (usually in format "↓1.49%")
        if (percentText) {
          // Remove any non-numeric characters except minus sign and decimal point
          const percentMatch = percentText.match(/([-\d.]+)%/);
          if (percentMatch && percentMatch[1]) {
            changePercent = parseFloat(percentMatch[1]);
            // Check if it should be negative based on arrow direction
            if (percentText.includes("↓") && changePercent > 0) {
              changePercent = -changePercent;
            }
          }
        }
        console.log(
          `Percent Change: ${changePercent}% (from "${percentText}")`
        );

        // 3. Get the absolute change value (P2Luy Ebnabc)
        const changeText = $(".P2Luy.Ebnabc").text().trim();
        let change = 0;

        if (changeText) {
          // Format is typically "-345.65 Today" or "+123.45 Today"
          const changeMatch = changeText.match(/([-+]?[\d,.]+)/);
          if (changeMatch && changeMatch[1]) {
            change = parseFloat(changeMatch[1].replace(/,/g, ""));
          }
        }
        console.log(`Change: ${change} (from "${changeText}")`);

        results.push({
          symbol: index.id,
          name: index.name,
          price: price,
          change: change,
          changePercent: changePercent,
          source: "Google Finance",
          timestamp: new Date().toISOString(),
          url: url,
        });
      } catch (error) {
        console.error(`Error fetching data for ${index.id}:`, error);
        results.push({
          symbol: index.id,
          name: index.name,
          price: 0,
          change: 0,
          changePercent: 0,
          error: error instanceof Error ? error.message : "Unknown error",
          source: "Google Finance - ERROR",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      timestamp: Date.now(),
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Google Finance API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch Google Finance data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
