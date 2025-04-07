// src/app/api/market-indices/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface MarketIndex {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  lastUpdated: string;
}

export async function GET() {
  try {
    const indices = [
      { name: "Dow Jones", symbol: "%5EDJI" },
      { name: "CBOE Volatility Index", symbol: "%5EVIX" },
      { name: "NASDAQ Composite", symbol: "%5EIXIC" },
      { name: "S&P 500", symbol: "%5EGSPC" },
    ];

    const results = await Promise.allSettled(
      indices.map(async (index) => {
        try {
          const response = await fetch(
            `https://finance.yahoo.com/quote/${index.symbol}/`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
              cache: "no-store",
            }
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch data for ${index.name}: ${response.status}`
            );
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          // Extract data
          const price = $('[data-testid="qsp-price"]').first().text().trim();
          const change = $('[data-testid="qsp-price-change"]')
            .first()
            .text()
            .trim();
          const changePercent = $('[data-testid="qsp-price-change-percent"]')
            .first()
            .text()
            .trim();
          const lastUpdated = $('div[slot="marketTimeNotice"] span span')
            .first()
            .text()
            .trim();

          return {
            name: index.name,
            symbol: index.symbol,
            price,
            change,
            changePercent,
            lastUpdated,
          } as MarketIndex;
        } catch (error) {
          console.error(`Error fetching ${index.name}:`, error);
          throw error;
        }
      })
    );

    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<MarketIndex> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    const failedIndices = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .map((result, index) => indices[index].name);

    return NextResponse.json({
      data: successfulResults,
      failedIndices: failedIndices.length > 0 ? failedIndices : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in market indices API:", error);
    return NextResponse.json(
      { error: "Failed to fetch market indices data" },
      { status: 500 }
    );
  }
}
