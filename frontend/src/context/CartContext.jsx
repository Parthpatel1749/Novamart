import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    estimatedDelivery: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart when user signs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Local storage guest cart
      const saved = localStorage.getItem('novamart_guest_cart');
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {}
      }
    }
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await cartAPI.addItem({
          productId: product.id,
          quantity,
          selectedVariant,
        });
        if (res?.data) {
          setCart(res.data);
        }
        return res.data;
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback for guest
      const existingIndex = cart.items.findIndex(i => i.productId === product.id);
      let updatedItems = [...cart.items];
      const unitPrice = product.discountedPrice || product.price;

      if (existingIndex > -1) {
        updatedItems[existingIndex].quantity += quantity;
        updatedItems[existingIndex].subtotal = updatedItems[existingIndex].quantity * unitPrice;
      } else {
        updatedItems.push({
          id: Date.now(),
          productId: product.id,
          productTitle: product.title,
          productBrand: product.brand,
          productImageUrl: product.imageUrl,
          quantity,
          unitPrice,
          subtotal: unitPrice * quantity,
          selectedVariant,
          availableStock: product.availableStock,
        });
      }

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const estimatedDelivery = subtotal > 499 || subtotal === 0 ? 0 : 40;
      const updatedCart = {
        items: updatedItems,
        totalItems,
        subtotal,
        estimatedDelivery,
        grandTotal: subtotal + estimatedDelivery,
      };

      setCart(updatedCart);
      localStorage.setItem('novamart_guest_cart', JSON.stringify(updatedCart));
      return updatedCart;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await cartAPI.updateQuantity(itemId, quantity);
        if (res?.data) {
          setCart(res.data);
        }
      } finally {
        setLoading(false);
      }
    } else {
      let updatedItems = cart.items
        .map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity,
              subtotal: item.unitPrice * quantity,
            };
          }
          return item;
        })
        .filter(item => item.quantity > 0);

      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const estimatedDelivery = subtotal > 499 || subtotal === 0 ? 0 : 40;
      const updatedCart = {
        items: updatedItems,
        totalItems,
        subtotal,
        estimatedDelivery,
        grandTotal: subtotal + estimatedDelivery,
      };

      setCart(updatedCart);
      localStorage.setItem('novamart_guest_cart', JSON.stringify(updatedCart));
    }
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await cartAPI.removeItem(itemId);
        if (res?.data) {
          setCart(res.data);
        }
      } finally {
        setLoading(false);
      }
    } else {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      const estimatedDelivery = subtotal > 499 || subtotal === 0 ? 0 : 40;
      const updatedCart = {
        items: updatedItems,
        totalItems,
        subtotal,
        estimatedDelivery,
        grandTotal: subtotal + estimatedDelivery,
      };

      setCart(updatedCart);
      localStorage.setItem('novamart_guest_cart', JSON.stringify(updatedCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await cartAPI.clearCart();
    }
    const emptyCart = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      estimatedDelivery: 0,
      grandTotal: 0,
    };
    setCart(emptyCart);
    localStorage.removeItem('novamart_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
