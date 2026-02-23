// Cart utility functions using localStorage

const CART_KEY = 'vinsaky_cart';

// Get all cart items
export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Save cart
const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn('Cart save error:', e);
  }
};

// Add product to cart
export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const productId = product.id || product._id;
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId,
      name: product.name || 'Sản phẩm',
      price: product.price || 0,
      image: Array.isArray(product.image)
        ? product.image[0]
        : product.image || '',
      brand: product.brand || '',
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  saveCart(cart);
  return cart;
};

// Remove product from cart
export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
};

// Update quantity
export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  saveCart(cart);
  return cart;
};

// Clear all
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  return [];
};

// Get total items count
export const getCartCount = () => {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
};

// Get total price
export const getCartTotal = () => {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
};
