import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL || '/api/v1';

class SearchHistoryService {
  // Lưu lịch sử tìm kiếm
  static async saveSearchHistory(searchData) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/search-history/save`,
        searchData,
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving search history:", error);
      throw error;
    }
  }

  // Lấy lịch sử tìm kiếm
  static async getSearchHistory(page = 1, limit = 20, searchType = null) {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchType) {
        params.append("searchType", searchType);
      }

      const response = await axios.get(
        `${API_URL}/search-history/history?${params}`,
        {
          headers: {
            token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting search history:", error);
      throw error;
    }
  }

  // Lấy đề xuất tìm kiếm
  static async getSearchSuggestions(limit = 10, searchType = "product") {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/search-history/suggestions?limit=${limit}&searchType=${searchType}`,
        {
          headers: {
            token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      throw error;
    }
  }

  // Xóa một lịch sử tìm kiếm
  static async deleteSearchHistory(searchId) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/search-history/history/${searchId}`,
        {
          headers: {
            token,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting search history:", error);
      throw error;
    }
  }

  // Xóa toàn bộ lịch sử tìm kiếm
  static async clearAllSearchHistory() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/search-history/history`, {
        headers: {
          token,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error clearing search history:", error);
      throw error;
    }
  }
}

export default SearchHistoryService;
