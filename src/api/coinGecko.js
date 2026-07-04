const BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoins() {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch coins from CoinGecko:", error);
    throw error;
  }
}

export async function fetchCoinDetail(id) {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch coin detail from CoinGecko:", error);
    throw error;
  }
}

export async function fetchCoinMarketChart(id, days = 7) {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch market chart from CoinGecko:", error);
    throw error;
  }
}