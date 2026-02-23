import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import axios from "axios";
import "./styles/style.css";
import "./styles/vendor.css";
import "./styles/shop.css";

import BrandCarousel from "../Components/BrandCarousel";
import ProductsCarousel from "../Components/ProductCarousel";
import BestSellingCarousel from "../Components/BestSellingCarousel";
import BlogCarousel from "../Components/BlogCarousel";
import RecommendTagCarousel from "../Components/RecommendTagCarousel";
import Footer from "../Components/Footer";
import Canvas from "../Components/Canvas";
import ChatWidget from "../Components/WidgetChat";
import Header from "../Components/Header";
import BannerSection from "../Components/BannerSection";
import BannerSection2 from "../Components/BannerSection2";
import CategoryBar from "../Components/CategoryBar";
import FlashSaleSection from "../Components/FlashSaleSection";


const Home = () => {
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch products once - shared between BrandCarousel, ProductCarousel, BestSellingCarousel
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/product/`
        );

        // Cấu trúc: { success, data: { data: { items: [...], limit, skip } } }
        const data = response.data?.data?.data?.items
          || response.data?.data?.items
          || response.data?.items
          || (Array.isArray(response.data?.data) ? response.data.data : [])
          || [];

        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch posts once - shared with BlogCarousel
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/post/`
        );
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <HelmetProvider>
      <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
        <Header />
        <div className="content-wrapper">
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 12px" }}>
            <Helmet>
              <title>Vinsaky Shop — Thiết bị bếp công nghiệp</title>
              <meta charSet="utf-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="description" content="Vinsaky Shop — Thiết bị bếp công nghiệp, tủ đông, máy làm đá chất lượng cao, giao hàng toàn quốc." />
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Helmet>

            {/* Cart Offcanvas */}
            <div className="offcanvas offcanvas-end" data-bs-scroll="true" tabIndex="-1" id="offcanvasCart" aria-labelledby="offcanvasCartLabel">
              <div className="offcanvas-header justify-content-center">
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
              </div>
              <div className="offcanvas-body">
                <Canvas />
              </div>
            </div>

            {/* Hero slider */}
            <BannerSection2 />

            {/* Danh mục nhanh */}
            <CategoryBar />

            {/* Hàng mới về */}
            <BrandCarousel products={products} loading={loadingProducts} />

            {/* Flash sale */}
            <FlashSaleSection products={products} loading={loadingProducts} />

            {/* Sản phẩm hàng 2 tay / đặc biệt */}
            <ProductsCarousel products={products} loading={loadingProducts} />

            {/* Bán chạy nhất */}
            <BestSellingCarousel products={products} loading={loadingProducts} />

            {/* Blog */}
            <BlogCarousel posts={posts} loading={loadingPosts} />

            <RecommendTagCarousel />
            
            {/* Banner Section (USP or Custom Products) */}
            <BannerSection />
            
            <ChatWidget />
            <Footer />
          </div>
        </div>
      </div>
    </HelmetProvider>
  );

};

export default Home;

