// Utility functions for managing recently viewed products

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENT_PRODUCTS = 10;

// Load recently viewed products from localStorage
export const loadRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recently viewed products:', error);
    return [];
  }
};

// Add product to recently viewed
export const addToRecentlyViewed = (product) => {
  try {
    const recentlyViewedProducts = loadRecentlyViewed();
    
    // Remove if already exists
    const filteredProducts = recentlyViewedProducts.filter(p => p.id !== product.id);
    
    // Add to beginning
    filteredProducts.unshift(product);
    
    // Keep only last MAX_RECENT_PRODUCTS
    if (filteredProducts.length > MAX_RECENT_PRODUCTS) {
      filteredProducts.splice(MAX_RECENT_PRODUCTS);
    }
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filteredProducts));
    return filteredProducts;
  } catch (error) {
    console.error('Error saving recently viewed product:', error);
    return [];
  }
};

// Clear recently viewed products
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing recently viewed products:', error);
    return false;
  }
};

// Get recently viewed products count
export const getRecentlyViewedCount = () => {
  const products = loadRecentlyViewed();
  return products.length;
};

// Check if product is in recently viewed
export const isProductRecentlyViewed = (productId) => {
  const products = loadRecentlyViewed();
  return products.some(p => p.id === productId);
}; 