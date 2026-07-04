import { Link } from "react-router-dom";
import { formatLargeNumber } from "../utils/formatter";

function CryptoCard({ coin, viewMode = "grid" }) {
  if (viewMode === "list") {
    return (
      <Link
        to={`/coin/${coin.id}`}
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg px-6 py-4 hover:shadow-xl hover:border-slate-700 transition-all w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-[200px]">
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <p className="font-semibold text-slate-100">{coin.name}</p>
            <p className="text-xs text-slate-400 uppercase">
              {coin.symbol}
            </p>
          </div>
          <span className="text-xs font-semibold text-black bg-blue-400 rounded-full px-2 py-0.5">
            #{coin.market_cap_rank}
          </span>
        </div>

        <div className="text-right min-w-[120px]">
          <p className="text-base font-bold text-white">{formatLargeNumber(coin.current_price)}</p>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              coin.price_change_percentage_24h >= 0
                ? "text-green-400 bg-green-900/40"
                : "text-red-400 bg-red-900/40"
            }`}
          >
            {coin.price_change_percentage_24h >= 0 ? "↑ +" : "↓ "}
            {coin.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="text-xs text-slate-500">MARKET CAP</p>
          <p className="text-sm text-slate-400">{formatLargeNumber(coin.market_cap)}</p>
        </div>

        <div className="text-right min-w-[100px]">
          <p className="text-xs text-slate-500">VOLUME</p>
          <p className="text-sm text-slate-400">{formatLargeNumber(coin.total_volume)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/coin/${coin.id}`}
      className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl hover:border-slate-700 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={coin.image}
          alt={coin.name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-semibold text-slate-100">{coin.name}</p>
          <p className="text-sm text-slate-400 uppercase">
            {coin.symbol}
          </p>
          <span className="inline-block mt-1 text-xs font-semibold text-black bg-blue-400 rounded-full px-2.5 py-0.5">
            #{coin.market_cap_rank}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-white">
          {formatLargeNumber(coin.current_price)}
        </p>
        <span
          className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
            coin.price_change_percentage_24h >= 0
              ? "text-green-400 bg-green-900/40"
              : "text-red-400 bg-red-900/40"
          }`}
        >
          {coin.price_change_percentage_24h >= 0 ? "↑ +" : "↓ "}
          {coin.price_change_percentage_24h?.toFixed(2)}%
        </span>
        <hr className="border-slate-700 my-2" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-500">MARKET CAP</p>
            <p className="text-sm text-slate-400">{formatLargeNumber(coin.market_cap)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">VOLUME</p>
            <p className="text-sm text-slate-400">{formatLargeNumber(coin.total_volume)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CryptoCard;
