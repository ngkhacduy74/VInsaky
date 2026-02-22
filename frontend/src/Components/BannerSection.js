import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBanner } from "../context/BannerContext";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const BannerSection = () => {
  const navigate = useNavigate();
  const {
    bannerProducts: savedProducts,
    loading
  } = useBanner();
  const [visibleSlides, setVisibleSlides] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  const isCustomProducts = savedProducts.length > 0;

  // Function to calculate discounted price
  const calculateDiscountedPrice = (originalPrice, discountText) => {
    if (!originalPrice || !discountText) return { original: originalPrice, discounted: originalPrice };

    // Extract percentage from discount text (e.g., "Giảm 15%" -> 15)
    const percentageMatch = discountText.match(/(\d+)/);
    if (!percentageMatch) return { original: originalPrice, discounted: originalPrice };

    const discountPercentage = parseInt(percentageMatch[1]);

    // Extract numeric value from formatted price (e.g., "1.500.000 ₫" -> 1500000)
    const priceMatch = originalPrice.match(/[\d.]+/g);
    if (!priceMatch) return { original: originalPrice, discounted: originalPrice };

    // Remove commas and convert to number
    const originalPriceNum = parseInt(priceMatch.join('').replace(/\./g, ''));

    if (isNaN(originalPriceNum) || isNaN(discountPercentage)) {
      return { original: originalPrice, discounted: originalPrice };
    }

    const discountedPrice = originalPriceNum * (1 - discountPercentage / 100);

    return {
      original: originalPrice,
      discounted: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(discountedPrice)
    };
  };

  // Animation effect for slides appearing one by one - FIX vấn đề tải liên tục
  useEffect(() => {
    if (isCustomProducts && savedProducts.length > 0 && !animationComplete) {
      setVisibleSlides([]);
      
      const timeouts = [];
      savedProducts.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setVisibleSlides(prev => [...prev, index]);
          if (index === savedProducts.length - 1) {
            setTimeout(() => setAnimationComplete(true), 500);
          }
        }, index * 800);
        timeouts.push(timeout);
      });

      // Cleanup function để clear timeouts
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [savedProducts.length, isCustomProducts]); // Chỉ trigger khi length thay đổi

  // Loading state
  if (loading) {
    return (
      <section
        className="py-3"
        style={{ background: "#f8f9fa", minHeight: "150px" }}
      >
        <div className="container-fluid px-4">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải banner...</p>
          </div>
        </div>
      </section>
    );
  };

  // USP bar nhỏ gọn, màu trắng/xanh, hài hòa với slider ảnh trên
  if (!isCustomProducts || savedProducts.length === 0) {
    const usps = [
      { icon: "🚚", title: "Giao hàng toàn quốc", sub: "Miễn phí đơn từ 2 triệu" },
      { icon: "🛡️", title: "Bảo hành chính hãng", sub: "Đổi trả trong 30 ngày" },
      { icon: "💎", title: "Sản phẩm chất lượng cao", sub: "500+ mặt hàng cao cấp" },
      { icon: "📞", title: "Hỗ trợ 24/7", sub: "Hotline: 0903 242 748" },
    ];
    return (
      <section style={{
        background: "#f8f9fa",
        padding: "20px 16px",
        borderBottom: "1px solid #e9ecef",
      }}>
        <style>{`
          .usp-item {
            display: flex; align-items: center; gap: 12px;
            padding: 16px 20px;
            border-right: 1px solid #e9ecef;
            transition: background 0.2s;
            flex: 1;
            min-width: 180px;
          }
          .usp-item:last-child { border-right: none; }
          .usp-item:hover { background: #e8f0fe; border-radius: 12px; }
          .usp-icon {
            width: 40px; height: 40px; border-radius: 10px;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
          }
          .usp-title { font-weight: 700; font-size: 13px; color: #1e3a5f; margin-bottom: 1px; }
          .usp-sub { font-size: 11px; color: #6b7280; }
          @media (max-width: 768px) {
            .usp-item { border-right: none; border-bottom: 1px solid #e9ecef; }
            .usp-item:last-child { border-bottom: none; }
          }
        `}</style>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #dbeafe",
          borderTop: "3px solid #0d6efd",
          boxShadow: "0 2px 12px rgba(13,110,253,0.08)",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
        }}>
          {usps.map((u) => (
            <div className="usp-item" key={u.title}>
              <div className="usp-icon">{u.icon}</div>
              <div>
                <div className="usp-title">{u.title}</div>
                <div className="usp-sub">{u.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  }



  // Banner with saved products using Swiper
  return (
    <section
      className="py-3"
      style={{
        background: "#ffffff",
        minHeight: "350px",
      }}
    >
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="flex-grow-1">
                  <h3 className="text-dark fw-bold mb-2">
                    Sản phẩm được quan tâm
                  </h3>
                </div>
              </div>
            </div>

            {/* Swiper Banner */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={2}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 8000, // Tăng thời gian delay lên 8 giây
                disableOnInteraction: true, // Dừng autoplay khi user tương tác
                pauseOnMouseEnter: true, // Tạm dừng khi hover
              }}
              loop={savedProducts.length > 2}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 15,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
              }}
              className="product-banner-swiper"
            >
              {savedProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div className="banner-card position-relative bg-white rounded-3 shadow-lg overflow-hidden h-100">
                    {/* Main content container - Horizontal Layout */}
                    <div className="d-flex flex-row h-100" style={{ minHeight: "300px" }}>
                      
                      {/* Content Section - Left Side */}
                      <div className="banner-content-left flex-grow-1 p-4 d-flex flex-column justify-content-between">
                        {/* Top badge - chỉ hiển thị 1 badge duy nhất */}
                        <div className="mb-3">
                          <span className="badge bg-primary rounded-pill px-3 py-2 fw-semibold">
                            {product.badge} #{index + 1}
                          </span>
                        </div>

                        {/* Product info */}
                        <div className="flex-grow-1 d-flex flex-column justify-content-center">
                          <div className="text-muted mb-2 small fw-semibold text-uppercase">
                            {product.category}
                          </div>
                          <h5 className="fw-bold text-dark mb-3 lh-sm">
                            {product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name}
                          </h5>

                          <div className="price-section mb-3">
                            {(() => {
                              const priceInfo = calculateDiscountedPrice(product.price, product.discount);
                              const hasValidDiscount = product.discount && product.discount.trim() !== "" && product.discount.match(/(\d+)/);

                              return (
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <div className="price-display d-flex flex-column align-items-start">
                                    {hasValidDiscount && (
                                      <span className="original-price text-muted text-decoration-line-through">
                                        {priceInfo.original}
                                      </span>
                                    )}
                                    <span className="discounted-price text-success fw-bold fs-5">
                                      {hasValidDiscount ? priceInfo.discounted : product.price}
                                    </span>
                                  </div>
                                  {hasValidDiscount && (
                                    <span className="badge bg-danger px-2 py-1 rounded-pill">
                                      {product.discount}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="banner-action mt-auto">
                          <button
                            className="btn btn-dark px-4 py-2 rounded-3 fw-semibold transition-all"
                            onClick={() => navigate(`/productView/${product.id}`)}
                          >
                            {product.buttonText} 
                            <i className="fas fa-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>

                      {/* Image Section - Right Side */}
                      <div className="banner-image-right flex-shrink-0 position-relative">
                        <div className="position-relative h-100 d-flex align-items-center">
                          <img
                            src={product.image}
                            className="img-fluid rounded-3 shadow-sm"
                            alt={product.name}
                            style={{
                              height: "280px",
                              width: "200px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Enhanced Custom CSS for Swiper */}
            <style>{`
              .product-banner-swiper {
                padding: 10px 0 40px 0;
              }
              
              .product-banner-swiper .swiper-pagination {
                bottom: 10px;
              }
              
              .product-banner-swiper .swiper-pagination-bullet {
                background: #007bff;
                opacity: 0.4;
                width: 12px;
                height: 12px;
                margin: 0 6px;
                transition: all 0.5s ease;
              }
              
              .product-banner-swiper .swiper-pagination-bullet-active {
                opacity: 1;
                transform: scale(1.2);
              }
              
              .product-banner-swiper .swiper-button-next,
              .product-banner-swiper .swiper-button-prev {
                color: #007bff;
               
                border-radius: 50%;
                width: 20px;
                height: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.5s ease;
                margin-top: -20px;
              }
              
              .product-banner-swiper .swiper-button-next:hover,
              .product-banner-swiper .swiper-button-prev:hover {
                background: #007bff;
                color: white;
                transform: scale(1.05);
              }
              
              .product-banner-swiper .swiper-button-next:after,
              .product-banner-swiper .swiper-button-prev:after {
                font-size: 16px;
                font-weight: bold;
              }
              
              /* Banner Card Styles - Horizontal Layout */
              .banner-card {
                height: 320px;
                border: 1px solid rgba(0,0,0,0.08);
                transition: all 0.5s ease;
              }
              
              .banner-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
              }
              
              /* Left Content Section */
              .banner-content-left {
                min-width: 0; /* Allow flex item to shrink */
                padding-right: 1rem;
              }
              
              /* Right Image Section */
              .banner-image-right {
                width: 220px;
                padding: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              /* Price Display */
              .price-display .original-price {
                font-size: 0.85rem;
                line-height: 1.2;
              }
              
              .price-display .discounted-price {
                line-height: 1.2;
              }
              
              /* Button Hover Effect */
              .banner-action button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              }
              
              .transition-all {
                transition: all 0.5s ease;
              }
              
              /* Responsive adjustments */
              @media (max-width: 768px) {
                .banner-card {
                  height: 300px;
                }
                
                .banner-image-right {
                  width: 180px;
                  padding: 0.75rem;
                }
                
                .banner-image-right img {
                  height: 240px !important;
                  width: 160px !important;
                }
                
                .banner-content-left {
                  padding: 1rem 0.75rem;
                }
                
                .banner-content-left h5 {
                  font-size: 1rem;
                  margin-bottom: 0.75rem;
                }
                
                .discounted-price {
                  font-size: 1.1rem !important;
                }
              }
              
              @media (max-width: 576px) {
                .banner-card {
                  height: 280px;
                }
                
                .banner-image-right {
                  width: 150px;
                }
                
                .banner-image-right img {
                  height: 220px !important;
                  width: 140px !important;
                }
                
                .banner-content-left h5 {
                  font-size: 0.95rem;
                }
              }
              
              /* Animation for smooth loading */
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              .banner-card {
                animation: slideUp 1s ease-out;
              }
              
              /* Ensure equal heights for all cards */
              .product-banner-swiper .swiper-slide {
                height: auto;
                display: flex;
              }
              
              .product-banner-swiper .swiper-slide .banner-card {
                width: 100%;
                display: flex;
                flex-direction: column;
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;