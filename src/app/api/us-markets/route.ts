import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Define USMarketData interface
interface USMarketData {
  indexName: string;
  symbol: string;
  currentValue: number;
  changePercent: number;
  changePoints: number;
}

export async function GET() {
  try {
    // Browser-like headers to avoid being blocked
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html",
    };

    // Array to store US market data
    const usMarketData: USMarketData[] = [];

    // US indices to track
    const US_INDICES = [
      { id: "VIX", name: "VIX", exchange: "INDEXCBOE" },
      { id: ".INX", name: "S&P 500", exchange: "INDEXSP" },
      { id: ".IXIC", name: "NASDAQ", exchange: "INDEXNASDAQ" },
      { id: ".DJI", name: "Dow Jones", exchange: "INDEXDJX" },
    ];

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

        // Build a data extraction function specific to this index
        const extractData = () => {
          // 1. Get the price (YMlKec fxKbKc class)
          const priceText = $(".YMlKec.fxKbKc").first().text().trim();
          const price = parseFloat(priceText.replace(/,/g, "")) || 0;
          console.log(`Price: ${price} (from "${priceText}")`);

          // Variables to store the extracted data
          let changePercent = 0;
          let percentText = "";
          let changePoints = 0;
          let changeText = "";

          // Extract data differently based on the index
          // VIX is special - it often moves opposite to the market
          if (index.id === "VIX") {
            // Look for percentage in nZQ6l (up) or VOXKNe (down) class
            const upSelector = $("span.NydbP.nZQ6l");
            const downSelector = $("span.NydbP.VOXKNe");

            if (upSelector.length > 0) {
              percentText = upSelector.text().trim();
              const match = percentText.match(/([-+]?\d+\.\d+)%/);
              if (match && match[1]) {
                changePercent = parseFloat(match[1]);
              }
            } else if (downSelector.length > 0) {
              percentText = downSelector.text().trim();
              const match = percentText.match(/([-+]?\d+\.\d+)%/);
              if (match && match[1]) {
                changePercent = -parseFloat(match[1]);
              }
            }

            // Get the points change - look for Ez2Ioe (up) or Ebnabc (down)
            const upPoints = $("span.P2Luy.Ez2Ioe");
            const downPoints = $("span.P2Luy.Ebnabc");

            if (upPoints.length > 0) {
              changeText = upPoints.text().trim();
              const match = changeText.match(/([-+]?[\d,]+\.\d+)/);
              if (match && match[1]) {
                changePoints = parseFloat(match[1].replace(/,/g, ""));
              }
            } else if (downPoints.length > 0) {
              changeText = downPoints.text().trim();
              const match = changeText.match(/([-+]?[\d,]+\.\d+)/);
              if (match && match[1]) {
                changePoints = -parseFloat(match[1].replace(/,/g, ""));
              }
            }
          } else {
            // Regular market index
            // Find the parent container for this index
            const parentContainer = $(".ln0Gqe").first();

            // Get percentage change
            const percentElem = parentContainer.find("span.NydbP");
            if (percentElem.length > 0) {
              percentText = percentElem.text().trim();
              const match = percentText.match(/([-+]?\d+\.\d+)%/);
              if (match && match[1]) {
                changePercent = parseFloat(match[1]);
                // Check if it's a down percentage
                if (percentElem.hasClass("VOXKNe")) {
                  changePercent = -changePercent;
                }
              }
            }

            // Get points change
            const changeElem = parentContainer.find("span.P2Luy");
            if (changeElem.length > 0) {
              changeText = changeElem.text().trim();
              const match = changeText.match(/([-+]?[\d,]+\.\d+)/);
              if (match && match[1]) {
                changePoints = parseFloat(match[1].replace(/,/g, ""));
                // Ensure sign is consistent with percent change
                if (
                  (changePercent < 0 && changePoints > 0) ||
                  (changePercent > 0 && changePoints < 0)
                ) {
                  changePoints = -changePoints;
                }
              }
            }
          }

          console.log(
            `Percent Change: ${changePercent}% (from "${percentText}")`
          );
          console.log(`Change Points: ${changePoints} (from "${changeText}")`);

          return {
            price,
            changePercent,
            changePoints,
          };
        };

        // Extract the data
        const data = extractData();

        // Create US market data object
        const indexData: USMarketData = {
          indexName: index.name,
          symbol: index.id,
          currentValue: data.price,
          changePercent: data.changePercent,
          changePoints: data.changePoints,
        };

        // Add to our US market data array
        usMarketData.push(indexData);
        console.log(
          `Successfully processed data for ${index.name}: ${data.price}`
        );
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
