import { createContext, useState, useEffect } from "react";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const addToCart = (product) =>
    setCart((prev) => [...prev, { ...product, qty: 1 }]);

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
