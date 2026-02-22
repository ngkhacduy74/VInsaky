import React from "react";
import { useFavorite } from "../hooks/useFavorite";
import "./FavoriteButton.css";
import { toast } from "react-toastify";

const FavoriteButton = ({ productId, className = "" }) => {
  const { isFavorite, loading, toggleFavorite } = useFavorite(productId);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await toggleFavorite();
        toast.info("Đã xóa khỏi danh sách yêu thích!");
      } else {
        await toggleFavorite();
        toast.success("Đã thêm vào danh sách yêu thích!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <button
      className={`favorite-button ${
        isFavorite ? "favorited" : ""
      } ${className}`}
      onClick={handleToggleFavorite}
      disabled={loading}
      title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <svg
        className="heart-icon"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {loading && <div className="loading-spinner"></div>}
    </button>
  );
};

export default FavoriteButton;
