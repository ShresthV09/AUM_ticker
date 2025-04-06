import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { BSEIndexData } from "@/types";

// Google Finance symbols for BSE indices
const BSE_INDICES = [
  { id: "SENSEX", name: "BSE SENSEX", exchange: "INDEXBOM" },
  { id: "BSE-500", name: "BSE 500", exchange: "INDEXBOM" },
  { id: "BSE-SMLCAP", name: "BSE SMALLCAP", exchange: "INDEXBOM" },
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

    // Initialize the BSE data array
    const bseData: BSEIndexData[] = [];

    // Process each BSE index
    for (const index of BSE_INDICES) {
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

        // Create BSE index data object
        const indexData: BSEIndexData = {
          indexName: index.name,
          currentValue: price,
          open: open || price, // Use price as fallback
          high: high || price, // Use price as fallback
          low: low || price, // Use price as fallback
          prevClose: prevClose || price - change, // Calculate from change if not available
          changePoints: change,
          changePercent: changePercent,
          week52High: week52High || price, // Use price as fallback
          week52Low: week52Low || price, // Use price as fallback
          // These fields aren't available from Google Finance
          turnoverCrore: 0,
          percentInTotalTurnover: 0,
        };

        // Add to our BSE data array
        bseData.push(indexData);
        console.log(`Successfully processed data for ${index.name}: ${price}`);
      } catch (error) {
        console.error(`Error fetching data for ${index.name}:`, error);

        // Add placeholder data on error
        bseData.push({
          indexName: index.name,
          currentValue: 0,
          open: 0,
          high: 0,
          low: 0,
          prevClose: 0,
          changePoints: 0,
          changePercent: 0,
          week52High: 0,
          week52Low: 0,
          turnoverCrore: 0,
          percentInTotalTurnover: 0,
        });
      }
    }

    console.log(`Returning data for ${bseData.length} BSE indices`);

    // Return the parsed data
    return NextResponse.json(bseData);
  } catch (error) {
    console.error("Error fetching BSE data from Google Finance:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch BSE data from Google Finance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
