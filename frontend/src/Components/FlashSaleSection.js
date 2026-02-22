import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

// Countdown đến 23:59 hôm nay
function useCountdown() {
  const getSecondsLeft = () => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 0);
    return Math.max(0, Math.floor((end - now) / 1000));
  };
  const [secs, setSecs] = useState(getSecondsLeft());
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsLeft()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return { h, m, s };
}

function formatPrice(price) {
  if (!price && price !== 0) return "Liên hệ";
  return Number(price).toLocaleString("vi-VN") + " ₫";
}

function fakeDiscount(price) {
  // Tạo giá gốc cao hơn 15-30%
  const pct = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
  return Math.round(price * (1 + pct / 100));
}

export default function FlashSaleSection({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { h, m, s } = useCountdown();

  const saleProducts = products.slice(0, 6);

  if (loading) return null;
  if (saleProducts.length === 0) return null;

  return (
    <section style={{ margin: "16px 0" }}>
      <style>{`
        .flash-header {
          background: linear-gradient(135deg, #0d6efd, #0284c7);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px 16px 0 0;
        }
        .countdown-box {
          display: flex; gap: 6px; align-items: center;
        }
        .countdown-digit {
          background: rgba(255,255,255,0.25);
          color: white;
          font-weight: 800;
          font-size: 18px;
          border-radius: 6px;
          padding: 2px 8px;
          min-width: 34px;
          text-align: center;
        }
        .countdown-sep {
          color: white; font-weight: 800; font-size: 18px;
        }
        .flash-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: #e5e7eb;
        }
        @media (max-width: 992px) { .flash-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 576px) { .flash-grid { grid-template-columns: repeat(2, 1fr); } }
        .flash-card {
          background: #fff;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .flash-card:hover { background: #fffbf5; transform: translateY(-2px); z-index: 2; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .flash-badge {
          position: absolute; top: 8px; left: 8px;
          background: #0d6efd; color: white;
          font-size: 10px; font-weight: 700;
          padding: 2px 7px; border-radius: 4px;
        }
        .flash-img {
          width: 100%; aspect-ratio: 1;
          object-fit: contain; margin-bottom: 8px;
          border-radius: 8px;
        }
        .flash-name {
          font-size: 12px; color: #374151;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          margin-bottom: 6px; min-height: 32px;
        }
        .flash-price-new {
          font-size: 15px; font-weight: 800;
          color: #0d6efd;
        }
        .flash-price-old {
          font-size: 11px; color: #9ca3af;
          text-decoration: line-through;
        }
        .flash-progress-wrap {
          height: 5px; background: #f3f4f6;
          border-radius: 99px; margin-top: 8px;
        }
        .flash-progress-bar {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #0d6efd, #38bdf8);
        }
      `}</style>

      {/* Header */}
      <div className="flash-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span style={{ color: "white", fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>ĐẶC BIỆT HÔM NAY</span>
        </div>
        <div className="countdown-box">
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginRight: 4 }}>Kết thúc sau:</span>
          <span className="countdown-digit">{h}</span>
          <span className="countdown-sep">:</span>
          <span className="countdown-digit">{m}</span>
          <span className="countdown-sep">:</span>
          <span className="countdown-digit">{s}</span>
        </div>
        <button
          onClick={() => navigate("/products")}
          style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "white", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Xem tất cả
        </button>
      </div>

      {/* Product grid */}
      <div className="flash-grid" style={{ borderRadius: "0 0 16px 16px", overflow: "hidden" }}>
        {saleProducts.map((p, i) => {
          const price = p.price || p.gia || 0;
          const oldPrice = fakeDiscount(price);
          const sold = [45, 72, 88, 30, 60, 95][i] || 50;
          return (
            <div
              className="flash-card"
              key={p._id || p.id || i}
              onClick={() => navigate(`/products/${p._id || p.id}`)}
            >
              <span className="flash-badge">SALE</span>
              <img
                src={p.img?.[0] || p.image || p.anh || "https://via.placeholder.com/200x200?text=No+Image"}
                alt={p.name || p.ten}
                className="flash-img"
              />
              <p className="flash-name">{p.name || p.ten || "Sản phẩm"}</p>
              <div className="flash-price-new">{formatPrice(price)}</div>
              <div className="flash-price-old">{formatPrice(oldPrice)}</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>Đã bán: {sold}%</div>
              <div className="flash-progress-wrap">
                <div className="flash-progress-bar" style={{ width: `${sold}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
