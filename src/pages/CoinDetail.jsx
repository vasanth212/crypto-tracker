import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bitcoin, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchCoinDetail, fetchCoinMarketChart } from "../api/coinGecko";
import { formatLargeNumber } from "../utils/formatter";

function CoinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    async function loadCoin() {
      try {
        setLoading(true);
        const data = await fetchCoinDetail(id);
        setCoin(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCoin();
  }, [id]);

  useEffect(() => {
    async function loadChart() {
      try {
        setChartLoading(true);
        const data = await fetchCoinMarketChart(id, 7);
        const formatted = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          price,
        }));
        setChartData(formatted);
      } catch (err) {
        console.error("Failed to load chart data:", err);
      } finally {
        setChartLoading(false);
      }
    }

    loadChart();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading coin details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-xl text-red-400">Error: {error}</p>
      </div>
    );
  }

  const price = coin.market_data?.current_price?.usd;
  const priceChange = coin.market_data?.price_change_percentage_24h;
  const high24h = coin.market_data?.high_24h?.usd;
  const low24h = coin.market_data?.low_24h?.usd;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/95 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
              <Bitcoin className="w-8 h-8 flex-shrink-0" />
              Crypto Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Track real-time cryptocurrency prices
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </header>

      <div className="pt-28 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {coin.image?.large && (
                <img
                  src={coin.image.large}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-slate-100">{coin.name}</p>
                <p className="text-sm text-slate-400 uppercase">{coin.symbol}</p>
                {coin.market_cap_rank && (
                  <span className="inline-block mt-1 text-xs font-semibold text-black bg-blue-400 rounded-full px-2.5 py-0.5">
                    #{coin.market_cap_rank}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">
                {price != null ? formatLargeNumber(price) : "N/A"}
              </p>
              <span
                className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                  priceChange >= 0
                    ? "text-green-400 bg-green-900/40"
                    : "text-red-400 bg-red-900/40"
                }`}
              >
                {priceChange >= 0 ? "↑ +" : "↓ "}
                {priceChange?.toFixed(2)}%
              </span>
              <hr className="border-slate-700 my-2" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500">24h High</p>
                  <p className="text-sm text-slate-400">
                    {high24h != null ? formatLargeNumber(high24h) : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">24h Low</p>
                  <p className="text-sm text-slate-400">
                    {low24h != null ? formatLargeNumber(low24h) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              7-Day Price Chart
            </h3>
            {chartLoading ? (
              <p className="text-sm text-slate-400">Loading chart...</p>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`
                    }
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                      fontSize: "14px",
                    }}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Price",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">No chart data available.</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1 uppercase">Market Cap</p>
              <p className="text-sm font-semibold text-slate-200">
                {coin.market_data?.market_cap?.usd != null
                  ? `${formatLargeNumber(coin.market_data.market_cap.usd)}`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1 uppercase">Volume (24h)</p>
              <p className="text-sm font-semibold text-slate-200">
                {coin.market_data?.total_volume?.usd != null
                  ? `${formatLargeNumber(coin.market_data.total_volume.usd)}`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1 uppercase">Circulating Supply</p>
              <p className="text-sm font-semibold text-slate-200">
                {coin.market_data?.circulating_supply != null
                  ? coin.market_data.circulating_supply.toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1 uppercase">Total Supply</p>
              <p className="text-sm font-semibold text-slate-200">
                {coin.market_data?.total_supply != null
                  ? coin.market_data.total_supply.toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full text-center text-xs text-slate-400 bg-slate-900/50 border-t border-slate-800 py-4">
        Data provided by CoinGecko API
      </footer>
    </div>
  );
}

export default CoinDetail;