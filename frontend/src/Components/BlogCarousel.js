import React, { useState, useEffect } from "react";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Utility function to format createdAt date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const BlogCarousel = ({ posts: allPosts = [], loading = false }) => {
  // Filter posts where condition is "Active"
  const posts = allPosts.filter((post) => post.condition === "Active");

  // Initialize Swiper after posts are loaded
  useEffect(() => {
    if (!loading && posts.length > 0) {
      new Swiper(".blog-carousel", {
        modules: [Navigation],
        slidesPerView: 3,
        spaceBetween: 30,
        speed: 500,
        navigation: {
          nextEl: ".blog-carousel-next",
          prevEl: ".blog-carousel-prev",
        },
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          991: { slidesPerView: 3 },
        },
      });
    }
  }, [loading, posts]);

  const BlogPost = ({ image, date, category, title, description, postId }) => (
    <article className="post-item card border-0 shadow-sm p-3">
      <div className="image-holder zoom-effect">
        <a href={`/postView/${postId}`}>
          <img src={image} alt={title || "post"} className="card-img-top" />
        </a>
      </div>
      <div className="card-body">
        <div className="post-meta d-flex text-uppercase gap-3 my-2 align-items-center">
          <div className="meta-date">
            <svg width="16" height="16">
              <use href="#calendar" />
            </svg>{" "}
            {date}
          </div>
          <div className="meta-categories">
            <svg width="16" height="16">
              <use href="#category" />
            </svg>{" "}
            {category}
          </div>
        </div>
        <div className="post-header">
          <h3 className="post-title">
            <a href={`/postView/${postId}`} className="text-decoration-none">
              {title}
            </a>
          </h3>
          <p>{description}</p>
        </div>
      </div>
    </article>
  );

  if (loading) {
    return (
      <section id="latest-blog" className="py-5 text-center">
        <div className="container-fluid">
          <p>Loading posts...</p>
        </div>
      </section>
    );
  }



  if (posts.length === 0) {
    return (
      <section id="latest-blog" className="py-5 text-center">
        <div className="container-fluid">
          <div className="row">
            <div className="section-header d-flex align-items-center justify-content-between my-5">
              <h2 className="section-title">Các bài viết mới</h2>
              <div className="btn-wrap align-right">

              </div>
            </div>
          </div>
          <p>No posts yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="shop-section-wrap">
      {/* Shop section header */}
      <div className="shop-section-head">
        <div className="title-group">
          <div className="accent-bar" style={{ background: "linear-gradient(180deg,#8b5cf6,#06b6d4)" }} />
          <h5>Bài viết mới nhất</h5>
        </div>
        <a href="/posts" className="see-all">Xem tất cả →</a>
      </div>
      <div className="shop-section-body">
        <div className="container-fluid">
          <div className="row">
          <div className="col-md-12">
            <div className="blog-carousel swiper">
              <div className="swiper-wrapper">
                {posts.map((post) => (
                  <div className="swiper-slide" key={post._id}>
                    <BlogPost
                      image={Array.isArray(post.image) ? post.image[0] : post.image || "/images/default-post.jpg"}
                      date={formatDate(post.createdAt)}
                      category={post.category || "N/A"}
                      title={post.title || "Untitled"}
                      description={post.description || "No description available."}
                      postId={post.id || post._id}
                    />
                  </div>
                ))}
              </div>
              <div className="swiper-buttons d-flex justify-content-center mt-3">
                <button className="swiper-prev blog-carousel-prev btn btn-yellow">
                  ❮
                </button>
                <button className="swiper-next blog-carousel-next btn btn-yellow">
                  ❯
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default BlogCarousel;
