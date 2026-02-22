import { useState, useEffect, useCallback } from "react";
import SearchHistoryService from "../Services/searchHistory.service";

const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lưu lịch sử tìm kiếm
  const saveSearch = useCallback(async (searchData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // Chỉ lưu khi đã đăng nhập

      await SearchHistoryService.saveSearchHistory(searchData);

      // Reload suggestions sau khi lưu
      loadSuggestions();
    } catch (error) {
      console.error("Error saving search:", error);
    }
  }, []);

  // Lấy lịch sử tìm kiếm
  const loadSearchHistory = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setSearchHistory([]);
        return;
      }

      const response = await SearchHistoryService.getSearchHistory(page, limit);
      setSearchHistory(response.data);
    } catch (error) {
      setError("Không thể tải lịch sử tìm kiếm");
      console.error("Error loading search history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy đề xuất tìm kiếm
  const loadSuggestions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSuggestions(null);
        return;
      }

      const response = await SearchHistoryService.getSearchSuggestions(
        10,
        "product"
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  }, []);

  // Xóa một lịch sử tìm kiếm
  const deleteSearchHistory = useCallback(
    async (searchId) => {
      try {
        await SearchHistoryService.deleteSearchHistory(searchId);

        // Reload data
        loadSearchHistory();
        loadSuggestions();
      } catch (error) {
        console.error("Error deleting search history:", error);
      }
    },
    [loadSearchHistory, loadSuggestions]
  );

  // Xóa toàn bộ lịch sử
  const clearAllHistory = useCallback(async () => {
    try {
      await SearchHistoryService.clearAllSearchHistory();

      // Clear local state
      setSearchHistory([]);
      setSuggestions(null);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }, []);

  // Lưu tìm kiếm sản phẩm
  const saveProductSearch = useCallback(
    async (query, results = [], filters = {}) => {
      const searchData = {
        searchQuery: query,
        searchType: "product",
        searchResults: results.map((product) => ({ productId: product._id })),
        filters,
      };

      await saveSearch(searchData);
    },
    [saveSearch]
  );

  // Lưu tìm kiếm bài viết
  const savePostSearch = useCallback(
    async (query, results = [], filters = {}) => {
      const searchData = {
        searchQuery: query,
        searchType: "post",
        searchResults: results.map((post) => ({ postId: post._id })),
        filters,
      };

      await saveSearch(searchData);
    },
    [saveSearch]
  );

  // Load data khi component mount
  useEffect(() => {
    loadSearchHistory();
    loadSuggestions();
  }, [loadSearchHistory, loadSuggestions]);

  return {
    searchHistory,
    suggestions,
    loading,
    error,
    saveProductSearch,
    savePostSearch,
    saveSearch,
    loadSearchHistory,
    loadSuggestions,
    deleteSearchHistory,
    clearAllHistory,
  };
};

export default useSearchHistory;
