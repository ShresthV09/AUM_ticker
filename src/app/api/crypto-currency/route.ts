import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

// Data interface with previous close and all-time high
interface CryptoData {
  name: string;
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

    // Define the instruments we want to track
    const INSTRUMENTS = [
      {
        id: "BTC-USD",
        name: "Bitcoin",
        previousClose: 79255.61,
        allTimeHigh: 108268,
        isCrypto: true,
      },
      {
        id: "NYICDX",
        name: "Dollar Index",
        exchange: "INDEXNYSEGIS",
        previousClose: 103.45,
        allTimeHigh: 164.72,
      },
    ];

    // Array to store data
    const cryptoData: CryptoData[] = [];

    // Process each instrument
    for (const instrument of INSTRUMENTS) {
      try {
        console.log(
          `Fetching data for ${instrument.name} (${instrument.id})...`
        );

        // Using the exact Google Finance URL format, with special handling for cryptocurrencies
        let url;
        if (instrument.isCrypto) {
          url = `https://www.google.com/finance/quote/${instrument.id}`;
        } else {
          url = `https://www.google.com/finance/quote/${instrument.id}:${instrument.exchange}`;
        }
        console.log(`URL: ${url}`);

        const response = await axios.get(url, {
          headers,
          timeout: 10000,
        });

        // Parse the HTML response using cheerio
        const $ = cheerio.load(response.data);

        // Multiple attempts to get the price using different selectors
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
          currentPrice = instrument.previousClose;
          console.log(
            `Warning: Using previous close as fallback for ${instrument.name}`
          );
        }

        // Calculate percentage from all-time high
        const percentFromATH =
          ((instrument.allTimeHigh - currentPrice) / instrument.allTimeHigh) *
          100;

        // Create data object
        const instrumentData: CryptoData = {
          name: instrument.name,
          symbol: instrument.id,
          currentValue: currentPrice,
          previousClose: instrument.previousClose,
          allTimeHigh: instrument.allTimeHigh,
          percentFromATH: Math.round(percentFromATH * 100) / 100, // Round to 2 decimal places
        };

        // Add to our data array
        cryptoData.push(instrumentData);
        console.log(
          `Successfully processed data for ${instrument.name}: ${currentPrice}`
        );
      } catch (error) {
        console.error(`Error fetching data for ${instrument.name}:`, error);

        // Add data with just previous close on error
        cryptoData.push({
          name: instrument.name,
          symbol: instrument.id,
          currentValue: instrument.previousClose, // Use previous close as fallback
          previousClose: instrument.previousClose,
          allTimeHigh: instrument.allTimeHigh,
          percentFromATH: 0,
        });
      }
    }

    console.log(`Returning data for ${cryptoData.length} instruments`);

    // Return the parsed data
    return NextResponse.json(cryptoData);
  } catch (error) {
    console.error("Error fetching crypto data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch crypto data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
