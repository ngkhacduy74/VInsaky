import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
    "Máy Làm Đá", "Bếp á công nghiệp", "Bếp âu công nghiệp", "Tủ nấu cơm",
    "Tủ sấy bát công nghiệp", "Bàn inox", "Xe đẩy inox", "Máy Pha Cafe",
    "Quầy pha chế inox", "Tủ đông công nghiệp", "Tủ lạnh công nghiệp",
    "Tủ mát công nghiệp", "Bàn Lạnh", "Bàn Mát", "Bàn Đông",
    "Bếp Từ Công Nghiệp", "Máy Làm Kem"
];

const features = [
    {
        title: "Mua sắm dễ dàng",
        desc: "Tìm kiếm và đặt hàng nhanh chóng",
        color: "#0d6efd",
        bg: "#eff6ff",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={28} height={28} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
        ),
    },
    {
        title: "Bảo mật cao",
        desc: "Xác thực email, bảo vệ tài khoản",
        color: "#10b981",
        bg: "#ecfdf5",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={28} height={28} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
            </svg>
        ),
    },
    {
        title: "Kiểm soát chất lượng",
        desc: "Kiểm tra kỹ từng sản phẩm trước khi giao",
        color: "#f97316",
        bg: "#fff7ed",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={28} height={28} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
            </svg>
        ),
    },
    {
        title: "Hỗ trợ AI",
        desc: "AI trả lời mọi câu hỏi về sản phẩm",
        color: "#6366f1",
        bg: "#eef2ff",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={28} height={28} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                <line x1="12" y1="15" x2="12" y2="17"/>
            </svg>
        ),
    },
    {
        title: "So sánh sản phẩm",
        desc: "Dễ dàng so sánh nhiều sản phẩm",
        color: "#0284c7",
        bg: "#f0f9ff",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={28} height={28} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
        ),
    },
];

const RecommendTagCarousel = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* ===== Tìm kiếm phổ biến ===== */}
            <section className="shop-section-wrap">
                <div className="shop-section-head">
                    <div className="title-group">
                        <div className="accent-bar" style={{ background: "linear-gradient(180deg,#0d6efd,#60a5fa)" }} />
                        <h5>Tìm kiếm phổ biến</h5>
                    </div>
                </div>
                <div className="shop-section-body">
                    <style>{`
                        .search-tag {
                            display: inline-flex;
                            align-items: center;
                            gap: 5px;
                            padding: 5px 14px;
                            margin: 4px;
                            border-radius: 20px;
                            border: 1.5px solid #e0e7ff;
                            background: #fff;
                            color: #374151;
                            font-size: 13px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.15s;
                            text-decoration: none;
                        }
                        .search-tag:hover {
                            border-color: #0d6efd;
                            color: #0d6efd;
                            background: #eff6ff;
                            transform: translateY(-1px);
                        }
                    `}</style>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                className="search-tag"
                                onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Tại sao chọn Vinsaky ===== */}
            <section style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #0d6efd 100%)",
                borderRadius: 12,
                margin: "12px 0",
                padding: "28px 24px",
            }}>
                <style>{`
                    .why-us-title {
                        color: white;
                        font-size: 18px;
                        font-weight: 700;
                        margin: 0 0 20px;
                        text-align: center;
                        letter-spacing: -0.2px;
                    }
                    .feature-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 12px;
                    }
                    @media (max-width: 992px) { .feature-grid { grid-template-columns: repeat(3, 1fr); } }
                    @media (max-width: 576px) { .feature-grid { grid-template-columns: repeat(2, 1fr); } }
                    .feature-card {
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.15);
                        border-radius: 10px;
                        padding: 16px 14px;
                        text-align: center;
                        transition: background 0.2s, transform 0.2s;
                        cursor: default;
                    }
                    .feature-card:hover {
                        background: rgba(255,255,255,0.18);
                        transform: translateY(-3px);
                    }
                    .feature-icon-box {
                        width: 48px; height: 48px;
                        border-radius: 10px;
                        display: flex; align-items: center; justify-content: center;
                        margin: 0 auto 10px;
                    }
                    .feature-title {
                        color: white;
                        font-size: 13px;
                        font-weight: 700;
                        margin: 0 0 4px;
                    }
                    .feature-desc {
                        color: rgba(255,255,255,0.7);
                        font-size: 11px;
                        line-height: 1.4;
                        margin: 0;
                    }
                `}</style>

                <h3 className="why-us-title">Tại sao chọn Vinsaky?</h3>
                <div className="feature-grid">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon-box" style={{ background: f.bg }}>
                                <span style={{ color: f.color }}>{f.icon}</span>
                            </div>
                            <p className="feature-title">{f.title}</p>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default RecommendTagCarousel;