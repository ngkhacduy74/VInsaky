import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BannerContext = createContext();

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider = ({ children }) => {
  const [bannerProducts, setBannerProducts] = useState([]);
  const [bannerProductIds, setBannerProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load banner products
  const loadBannerProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/banner`,
        { timeout: 15000 } // Tăng timeout lên 15 giây
      );

      if (response.data.success) {
        setBannerProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading banner products:', error);
      setBannerProducts([]);
    }
  };

  // Load banner product IDs
  const loadBannerProductIds = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/banner/ids`,
        { timeout: 15000 } // Tăng timeout lên 15 giây
      );

      if (response.data.success) {
        const ids = response.data.data?.productIds || [];
        setBannerProductIds(ids);
      }
    } catch (error) {
      console.error('Error loading banner product IDs:', error);
      setBannerProductIds([]);
    }
  };

  // Refresh all banner data
  const refreshBannerData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBannerProducts(),
        loadBannerProductIds()
      ]);
      setLastUpdate(new Date());
      setIsInitialized(true);
    } catch (error) {
      console.error('Error refreshing banner data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add product ID to banner
  const addProductIdToBanner = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/banner/ids/add`,
        { productId },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setBannerProductIds(response.data.data.productIds);
        await loadBannerProducts(); // Reload products after adding ID
        setLastUpdate(new Date());
        return { success: true, message: "Đã thêm sản phẩm vào banner thành công!" };
      }
    } catch (error) {
      console.error('Error adding product ID to banner:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Lỗi khi thêm sản phẩm vào banner!" 
      };
    }
  };

  // Remove product ID from banner
  const removeProductIdFromBanner = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/banner/ids/${productId}`,
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setBannerProductIds(response.data.data.productIds);
        await loadBannerProducts(); // Reload products after removing ID
        setLastUpdate(new Date());
        return { success: true, message: "Đã xóa sản phẩm khỏi banner thành công!" };
      }
    } catch (error) {
      console.error('Error removing product ID from banner:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Lỗi khi xóa sản phẩm khỏi banner!" 
      };
    }
  };

  // Save banner products (also updates product IDs)
  const saveBannerProducts = async (products) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/banner/save`,
        { products },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update both products and IDs
        setBannerProducts(response.data.data || []);
        if (response.data.bannerIds) {
          setBannerProductIds(response.data.bannerIds.productIds || []);
        }
        setLastUpdate(new Date());
        return { 
          success: true, 
          message: response.data.message || `Đã lưu ${products.length} sản phẩm vào banner thành công!` 
        };
      }
    } catch (error) {
      console.error('Error saving banner products:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Lỗi khi lưu banner products!" 
      };
    }
  };

  // Clear all banner data
  const clearBannerData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/banner/clear`, {
        headers: {
          token,
          "Content-Type": "application/json",
        },
      });

      setBannerProducts([]);
      setBannerProductIds([]);
      setLastUpdate(new Date());
      return { success: true, message: "Đã xóa tất cả banner data!" };
    } catch (error) {
      console.error('Error clearing banner data:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Lỗi khi xóa banner data!" 
      };
    }
  };

  // Initial load
  useEffect(() => {
    if (!isInitialized) {
      refreshBannerData();
    }
  }, [isInitialized]);

  const value = {
    bannerProducts,
    bannerProductIds,
    loading,
    lastUpdate,
    refreshBannerData,
    addProductIdToBanner,
    removeProductIdFromBanner,
    saveBannerProducts,
    clearBannerData,
  };

  return (
    <BannerContext.Provider value={value}>
      {children}
    </BannerContext.Provider>
  );
}; 