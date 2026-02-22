import apiService from "./api.service";

const FAVORITE_API = {
  ADD: "/favorite/add",
  REMOVE: "/favorite/remove",
  LIST: "/favorite/list",
  CHECK: "/favorite/check",
  CLEAR: "/favorite/clear",
};

class FavoriteService {
  // Thêm sản phẩm vào danh sách yêu thích
  async addToFavorites(productId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await apiService.post(FAVORITE_API.ADD, { productId });
      return response.data;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  async removeFromFavorites(productId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await apiService.delete(
        `${FAVORITE_API.REMOVE}/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  }

  // Lấy danh sách sản phẩm yêu thích
  async getFavorites(page = 1, limit = 20) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await apiService.get(FAVORITE_API.LIST, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting favorites:", error);
      throw error;
    }
  }

  // Kiểm tra sản phẩm có trong danh sách yêu thích không
  async checkFavorite(productId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await apiService.get(
        `${FAVORITE_API.CHECK}/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking favorite:", error);
      throw error;
    }
  }

  // Xóa tất cả sản phẩm yêu thích
  async clearAllFavorites() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
      }

      const response = await apiService.delete(FAVORITE_API.CLEAR);
      return response.data;
    } catch (error) {
      console.error("Error clearing favorites:", error);
      throw error;
    }
  }
}

export default new FavoriteService();
