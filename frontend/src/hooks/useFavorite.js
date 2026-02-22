import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import favoriteService from "../Services/favorite.service";

export const useFavorite = (productId) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !productId) return;

    try {
      setLoading(true);
      const response = await favoriteService.checkFavorite(productId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setLoading(false);
    }
  }, [user, productId]);

  // Kiểm tra trạng thái yêu thích khi component mount
  useEffect(() => {
    if (user && productId) {
      checkFavoriteStatus();
    }
  }, [user, productId, checkFavoriteStatus]);


  const toggleFavorite = useCallback(async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    if (!productId) return;

    try {
      setLoading(true);

      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        await favoriteService.removeFromFavorites(productId);
        setIsFavorite(false);
      } else {
        // Thêm vào danh sách yêu thích
        await favoriteService.addToFavorites(productId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [user, productId, isFavorite]);

  return {
    isFavorite,
    loading,
    toggleFavorite,
    checkFavoriteStatus,
  };
};
