import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Interface for NSE index data
interface NSEIndexData {
  indexName: string;
  currentValue: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  indicativeClose: string;
  prevClose: number;
  prevDay: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  oneYearAgo: number;
  week52High: number;
  week52Low: number;
}

export async function GET() {
  try {
    // Browser-like headers to avoid being blocked
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html",
    };

    // Array to store NSE data
    const nseData: NSEIndexData[] = [];

    // NSE indices to track
    const NSE_INDICES = [
      { id: "NIFTY_50", name: "NIFTY 50", exchange: "INDEXNSE" },
      { id: "NIFTY_NEXT_50", name: "NIFTY NEXT 50", exchange: "INDEXNSE" },
      { id: "INDIA_VIX", name: "INDIA VIX", exchange: "INDEXNSE" },
    ];

    // Process each NSE index
    for (const index of NSE_INDICES) {
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

        console.log(`Extracting data for ${index.name} with exact selectors`);

        // First, find the main container that holds the data for this index
        // We'll extract each data element relative to its own containers

        // 1. Get the price (YMlKec fxKbKc class)
        // This is the main price, should be inside the first container
        const priceText = $(".YMlKec.fxKbKc").first().text().trim();
        const price = parseFloat(priceText.replace(/,/g, "")) || 0;
        console.log(`Price: ${price} (from "${priceText}")`);

        // Find the section that contains the up/down percentage
        // We'll search for elements related specifically to percentage changes
        let changePercent = 0;
        let percentText = "";

        // 2. Look for the green/red percentage container
        $(".NydbP").each((i, elem) => {
          const text = $(elem).text().trim();
          if (text.includes("%")) {
            percentText = text;

            // Extract the actual number from the percentage text
            const match = text.match(/([-+]?\d+\.\d+)%/);
            if (match && match[1]) {
              changePercent = parseFloat(match[1]);

              // Check if it has down arrow or is in the "down" span
              if ($(elem).hasClass("VOXKNe")) {
                changePercent = -Math.abs(changePercent);
              }
            }
          }
        });

        console.log(
          `Percent Change: ${changePercent}% (from "${percentText}")`
        );

        // 3. Get the change points
        // This is the actual points change, should be in P2Luy class
        let change = 0;
        let changeText = "";

        // Get the change text based on the index we're looking at
        $(".P2Luy").each((i, elem) => {
          const text = $(elem).text().trim();
          if (text.includes("Today")) {
            changeText = text;

            // Extract just the numeric part
            const match = text.match(/([-+]?[\d,]+\.\d+)/);
            if (match && match[1]) {
              change = parseFloat(match[1].replace(/,/g, ""));

              // Make sure the sign is correct
              if (
                (changePercent < 0 && change > 0) ||
                (changePercent > 0 && change < 0)
              ) {
                change = -change;
              }
            }
          }
        });

        console.log(`Change Points: ${change} (from "${changeText}")`);

        // Get market data section info (open, high, low, etc.)
        let open = 0;
        let high = 0;
        let low = 0;
        let prevClose = 0;
        let week52High = 0;
        let week52Low = 0;

        // Looking for table data
        $(".AHmHk").each((i, section) => {
          const label = $(section).find(".roakge").text().trim();
          const value =
            parseFloat(
              $(section).find(".T1sMfe").text().trim().replace(/,/g, "")
            ) || 0;

          console.log(`Found data point: ${label} = ${value}`);

          if (label.includes("Open")) open = value;
          else if (label.includes("High")) high = value;
          else if (label.includes("Low")) low = value;
          else if (label.includes("Previous close")) prevClose = value;
          else if (label.includes("52-week high")) week52High = value;
          else if (label.includes("52-week low")) week52Low = value;
        });

        console.log(
          `Market data values: Open=${open}, High=${high}, Low=${low}, PrevClose=${prevClose}`
        );

        // Create NSE index data object
        const indexData: NSEIndexData = {
          indexName: index.name,
          currentValue: price,
          changePercent: changePercent,
          open: open || price, // Use price as fallback
          high: high || price, // Use price as fallback
          low: low || price, // Use price as fallback
          indicativeClose: "-", // Not available in Google Finance
          prevClose: prevClose || price - change, // Calculate from change if not available
          prevDay: prevClose || price - change, // Same as prevClose
          oneWeekAgo: 0, // Not available in basic Google Finance data
          oneMonthAgo: 0, // Not available in basic Google Finance data
          oneYearAgo: 0, // Not available in basic Google Finance data
          week52High: week52High || price, // Use price as fallback
          week52Low: week52Low || price, // Use price as fallback
        };

        // Add to our NSE data array
        nseData.push(indexData);
        console.log(`Successfully processed data for ${index.name}: ${price}`);
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Add placeholder data on error
        nseData.push({
          indexName: index.name,
          currentValue: 0,
          changePercent: 0,
          open: 0,
          high: 0,
          low: 0,
          indicativeClose: "-",
          prevClose: 0,
          prevDay: 0,
          oneWeekAgo: 0,
          oneMonthAgo: 0,
          oneYearAgo: 0,
          week52High: 0,
          week52Low: 0,
        });
      }
    }

    console.log(`Returning data for ${nseData.length} NSE indices`);

    // Return the parsed data
    return NextResponse.json(nseData);
  } catch (error) {
    console.error("Error fetching NSE data from Google Finance:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch NSE data from Google Finance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
