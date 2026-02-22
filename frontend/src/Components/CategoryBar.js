import React from "react";
import { useNavigate } from "react-router-dom";

// SVG icons thực tế cho từng danh mục thiết bị bếp công nghiệp
const categories = [
  {
    label: "Tủ đông",
    key: "Tủ đông",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="9" y1="6" x2="9" y2="8" /><line x1="9" y1="14" x2="9" y2="19" />
      </svg>
    ),
  },
  {
    label: "Máy làm đá",
    key: "Máy Làm Đá",
    color: "#38bdf8",
    bg: "#f0f9ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <polygon points="12,2 19,7 19,17 12,22 5,17 5,7" /><path d="M12 2v20M5 7l14 10M19 7L5 17" />
      </svg>
    ),
  },
  {
    label: "Bếp công nghiệp",
    key: "Bếp",
    color: "#f97316",
    bg: "#fff7ed",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3v4M12 3v4M8 3v4" /><circle cx="8" cy="14" r="2" /><circle cx="16" cy="14" r="2" />
      </svg>
    ),
  },
  {
    label: "Bếp từ",
    key: "Bếp Từ",
    color: "#6366f1",
    bg: "#eef2ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="2" y="6" width="20" height="13" rx="2" /><circle cx="8.5" cy="12.5" r="2.5" /><circle cx="15.5" cy="12.5" r="2.5" /><path d="M2 10h20" />
      </svg>
    ),
  },
  {
    label: "Máy pha cà phê",
    key: "Máy Pha cà phê",
    color: "#92400e",
    bg: "#fef3c7",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <path d="M6 2h12v8H6z" /><path d="M6 10c0 4 3 6 6 6s6-2 6-6" /><path d="M9 22h6" /><path d="M12 16v6" /><path d="M18 6h2a2 2 0 010 4h-2" />
      </svg>
    ),
  },
  {
    label: "Máy làm kem",
    key: "Máy Làm Kem",
    color: "#ec4899",
    bg: "#fdf2f8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <path d="M12 2a5 5 0 015 5c0 3-5 9-5 9S7 10 7 7a5 5 0 015-5z" /><path d="M12 16l-3 6h6l-3-6" />
      </svg>
    ),
  },
  {
    label: "Nồi cơm công nghiệp",
    key: "Tủ nấu cơm",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <path d="M8 2h8l1 4H7L8 2z" /><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M4 18h16v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" /><path d="M9 10c0 2 6 2 6 0" />
      </svg>
    ),
  },
  {
    label: "Tủ mát",
    key: "Tủ mát",
    color: "#0d6efd",
    bg: "#eff6ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M5 12h14" /><path d="M9 6v3M9 15v3" />
      </svg>
    ),
  },
  {
    label: "Bàn đông",
    key: "Bàn đông",
    color: "#64748b",
    bg: "#f1f5f9",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="2" y="7" width="20" height="10" rx="1" /><path d="M6 17v4M18 17v4M2 11h20" />
      </svg>
    ),
  },
  {
    label: "Bếp âu",
    key: "Bếp âu",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={24} height={24}>
        <rect x="2" y="5" width="20" height="15" rx="2" /><path d="M7 5V3M12 5V3M17 5V3" /><ellipse cx="8" cy="13" rx="2" ry="1.5" /><ellipse cx="14" cy="13" rx="2" ry="1.5" /><path d="M2 9h20" />
      </svg>
    ),
  },
];

export default function CategoryBar() {
  const navigate = useNavigate();

  return (
    <section className="shop-section-wrap">
      <div className="shop-section-head">
        <div className="title-group">
          <div className="accent-bar" style={{ background: "linear-gradient(180deg,#0d6efd,#38bdf8)" }} />
          <h5>Danh mục sản phẩm</h5>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="see-all"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          Xem tất cả →
        </button>
      </div>

      <div className="shop-section-body">
        <div className="cat-bar-grid">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className="cat-item"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.key)}`)}
            >
              <div
                className="cat-icon-wrap"
                style={{ background: cat.bg, color: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="cat-label">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
