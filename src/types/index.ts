export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  highDay: number;
  lowDay: number;
  openPrice: number;
  prevClose: number;
  updateTime: number;
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface BSEIndexData {
  indexName: string;
  open: number;
  high: number;
  low: number;
  currentValue: number;
  prevClose: number;
  changePoints: number;
  changePercent: number;
  week52High: number;
  week52Low: number;
  turnoverCrore: number;
  percentInTotalTurnover: number;
}

export interface NSEIndexData {
  indexName: string;
  currentValue: number;
  changePercent: number;
  changePoints?: number;
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
