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
    <section className="flash-sale-section" style={{ margin: "32px 0" }}>
      <style>{`
        .flash-sale-section {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .flash-header {
          background: linear-gradient(135deg, #0d6efd 0%, #005ce6 100%);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .flash-title-wrap {
          display: flex; 
          align-items: center; 
          gap: 12px;
        }
        .flash-title-icon {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .flash-title-text {
          color: white; 
          font-weight: 800; 
          font-size: 1.25rem; 
          letter-spacing: 0.5px;
          margin: 0;
          text-transform: uppercase;
        }
        .countdown-box {
          display: flex; 
          gap: 8px; 
          align-items: center;
        }
        .countdown-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
          margin-right: 4px;
        }
        .countdown-digit {
          background: #ffffff;
          color: #0d6efd;
          font-weight: 800;
          font-size: 1.1rem;
          border-radius: 6px;
          padding: 4px 8px;
          min-width: 40px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .countdown-sep {
          color: white; 
          font-weight: 800; 
          font-size: 1.2rem;
        }
        .btn-view-all {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 30px;
          padding: 6px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-view-all:hover {
          background: #ffffff;
          color: #0d6efd;
        }
        .flash-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          background: #f1f5f9;
          gap: 1px;
        }
        @media (max-width: 1200px) { .flash-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 992px) { .flash-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 576px) { 
          .flash-grid { grid-template-columns: repeat(2, 1fr); }
          .flash-header { padding: 12px 16px; flex-direction: column; align-items: stretch; text-align: center; }
          .flash-title-wrap { justify-content: center; }
          .countdown-box { justify-content: center; margin: 8px 0; }
        }
        .flash-card {
          background: #ffffff;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .flash-card:hover { 
          transform: translateY(-4px); 
          z-index: 2; 
          box-shadow: 0 10px 20px rgba(0,0,0,0.08); 
          border-radius: 8px;
        }
        .flash-badge {
          position: absolute; 
          top: 12px; 
          left: 12px;
          background: #ef4444; 
          color: white;
          font-size: 0.7rem; 
          font-weight: 800;
          padding: 4px 8px; 
          border-radius: 6px;
          z-index: 5;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        .flash-img-wrapper {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .flash-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.5s ease;
        }
        .flash-card:hover .flash-img {
          transform: scale(1.05);
        }
        .flash-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .flash-name {
          font-size: 0.9rem; 
          color: #1e293b;
          font-weight: 500;
          display: -webkit-box; 
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; 
          overflow: hidden;
          margin-bottom: 8px; 
          line-height: 1.4;
          height: 2.8em; /* 2 lines exactly */
        }
        .flash-price-new {
          font-size: 1.15rem; 
          font-weight: 800;
          color: #ef4444;
          margin-top: auto;
        }
        .flash-price-old {
          font-size: 0.8rem; 
          color: #94a3b8;
          text-decoration: line-through;
          margin-bottom: 8px;
          height: 1.2em; /* Ensures spacing even if empty */
        }
        .flash-progress-container {
          margin-top: 12px;
        }
        .flash-sold-text {
          font-size: 0.75rem; 
          color: #64748b; 
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }
        .flash-progress-wrap {
          height: 6px; 
          background: #e2e8f0;
          border-radius: 99px; 
          overflow: hidden;
        }
        .flash-progress-bar {
          height: 100%; 
          border-radius: 99px;
          background: linear-gradient(90deg, #ef4444, #f97316);
        }
      `}</style>

      {/* Header */}
      <div className="flash-header">
        <div className="flash-title-wrap">
          <svg className="flash-title-icon" width="24" height="24" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <h2 className="flash-title-text">GIỜ VÀNG GIÁ SỐC</h2>
        </div>
        
        <div className="countdown-box">
          <span className="countdown-label">Kết thúc sau:</span>
          <span className="countdown-digit">{h}</span>
          <span className="countdown-sep">:</span>
          <span className="countdown-digit">{m}</span>
          <span className="countdown-sep">:</span>
          <span className="countdown-digit">{s}</span>
        </div>
        
        <button
          className="btn-view-all"
          onClick={() => navigate("/products")}
        >
          Xem tất cả <i className="fas fa-chevron-right ms-1" style={{ fontSize: '0.8rem' }}></i>
        </button>
      </div>

      {/* Product grid */}
      <div className="flash-grid">
        {saleProducts.map((p, i) => {
          const price = p.price || p.gia || 0;
          const oldPrice = fakeDiscount(price);
          const sold = [45, 72, 88, 30, 60, 95][i] || 50;
          const discountPercent = Math.round((1 - price / oldPrice) * 100);
          
          return (
            <div
              className="flash-card"
              key={p._id || p.id || i}
              onClick={() => navigate(`/product/${p._id || p.id}`)}
            >
              <div className="flash-badge">-{discountPercent}%</div>
              
              <div className="flash-img-wrapper">
                <img
                  src={p.img?.[0] || p.image || p.anh || "https://via.placeholder.com/200x200?text=No+Image"}
                  alt={p.name || p.ten}
                  className="flash-img"
                />
              </div>
              
              <div className="flash-content">
                <h3 className="flash-name">{p.name || p.ten || "Sản phẩm"}</h3>
                <div className="flash-price-new">{formatPrice(price)}</div>
                <div className="flash-price-old">{formatPrice(oldPrice)}</div>
                
                <div className="flash-progress-container">
                  <div className="flash-sold-text">
                    <span>Đã bán:</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{sold}%</span>
                  </div>
                  <div className="flash-progress-wrap">
                    <div className="flash-progress-bar" style={{ width: sold + '%' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
