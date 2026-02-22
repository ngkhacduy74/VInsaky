import React, { useEffect } from 'react';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Monitor, 
  Camera, 
  Watch
} from 'lucide-react';

const CategoryCarousel = () => {
  useEffect(() => {
    // Initialize Swiper
    new Swiper('.category-carousel', {
      modules: [Navigation],
      slidesPerView: 6,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: '.category-carousel-next',
        prevEl: '.category-carousel-prev',
      },
      breakpoints: {
        0: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        991: { slidesPerView: 4 },
        1500: { slidesPerView: 6 },
      },
    });
  }, []);

  return (
    <section className="py-5 overflow-hidden">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="section-header d-flex flex-wrap justify-content-between mb-5">
              <h2 className="section-title">Category</h2>
              <div className="d-flex align-items-center">
                <a href="#" className="btn-link text-decoration-none">
                  View All Categories →
                </a>
                <div className="swiper-buttons">
                  <button className="swiper-prev category-carousel-prev btn btn-yellow">
                    ❮
                  </button>
                  <button className="swiper-next category-carousel-next btn btn-yellow">
                    ❯
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="category-carousel swiper">
              <div className="swiper-wrapper">
                <a href="/" className="nav-link category-item swiper-slide">
                  <Smartphone size={48} />
                  <h3 className="category-title">Điện Thoại</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Laptop size={48} />
                  <h3 className="category-title">Laptop</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Headphones size={48} />
                  <h3 className="category-title">Tai Nghe</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Monitor size={48} />
                  <h3 className="category-title">Màn Hình</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Camera size={48} />
                  <h3 className="category-title">Máy Ảnh</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Watch size={48} />
                  <h3 className="category-title">Đồng Hồ Thông Minh</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Smartphone size={48} />
                  <h3 className="category-title">Điện Thoại</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Laptop size={48} />
                  <h3 className="category-title">Laptop</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Headphones size={48} />
                  <h3 className="category-title">Tai Nghe</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Monitor size={48} />
                  <h3 className="category-title">Màn Hình</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Camera size={48} />
                  <h3 className="category-title">Máy Ảnh</h3>
                </a>
                <a href="/" className="nav-link category-item swiper-slide">
                  <Watch size={48} />
                  <h3 className="category-title">Đồng Hồ Thông Minh</h3>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;