import { useState, useEffect } from "react";
import { Bitcoin } from "lucide-react";
import { fetchCoins } from "../api/coinGecko";
import CryptoCard from "../components/CryptoCard";

function Home() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("rank");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCoins() {
      try {
        setLoading(true);
        const data = await fetchCoins();
        setCoins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCoins();
  }, []);

  const filteredCoins = searchQuery
    ? coins.filter((coin) => {
        const query = searchQuery.toLowerCase();
        return (
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
        );
      })
    : coins;

  function getSortedCoins() {
    const sorted = [...filteredCoins];
    switch (sortBy) {
      case "rank":
        sorted.sort((a, b) => (a.market_cap_rank || 999) - (b.market_cap_rank || 999));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.current_price - b.current_price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.current_price - a.current_price);
        break;
      case "change":
        sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
        break;
      case "market-cap":
        sorted.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        break;
      default:
        break;
    }
    return sorted;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading coins...</p>
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
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search coins by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="pt-28 p-8">
        <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400 font-medium">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="rank">Rank</option>
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="change">24h Change</option>
              <option value="market-cap">Market Cap</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
              : "flex flex-col gap-4 max-w-7xl mx-auto"
          }
        >
          {getSortedCoins().map((coin) => (
            <CryptoCard key={coin.id} coin={coin} viewMode={viewMode} />
          ))}
        </div>
      </div>

      <footer className="w-full text-center text-xs text-slate-400 bg-slate-900/50 border-t border-slate-800 py-4">
        Data provided by CoinGecko API
      </footer>
    </div>
  );
}

export default Home;