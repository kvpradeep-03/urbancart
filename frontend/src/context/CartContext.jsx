// src/context/CartContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export const CartContext = createContext(null);

// cartProvider component wraps the app and provides cart values to any nested components in app
// the children is a react prop that represents whatever you wrap inside <CartProvider> in your app
export const CartProvider = ({ children }) => {
  // initialize from localStorage safely
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  // Every time cart changes this effect runs and writes the new cart into localStorage.
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // add product: if exists -> increment qty, else push with qty 1
  // useCallback is like useMemo, but instead of caching a value, it caches a function.
  // React sees functions as new objects every render. Without useCallback, a function you define inside a component is recreated every time the component re-renders.
  const addToCart = useCallback((product, options = {}, qty = 1) => {
    //options can hold anything: size, color, customizations, etc.
    //...options spreads those into the product object before adding it to the cart.
    setCart((prev) => {
      const existing = prev.find(
        (p) =>
          p.id === product.id &&
          JSON.stringify(p.options) === JSON.stringify(options) // compare options too
      );

      if (existing) {
        // inc qty if same product + same options
        return prev.map((p) =>
          p.id === product.id &&
          JSON.stringify(p.options) === JSON.stringify(options)
            ? { ...p, qty: p.qty + 1 }
            : p
        );
      }
      //we are storing options(size,color, etc..) inside the each product object in cart
      return [...prev, { ...product, options, qty }];
    });
  }, []);

  // Increase quantity for an item (ensures qty is at least 1)
  const incQty = useCallback((id, options = {}) => {
    setCart((prev) => {
      // Find the existing item with the same product ID and identical options
      const existing = prev.find(
        (p) =>
          p.id === id && JSON.stringify(p.options) === JSON.stringify(options)
      );
      // If the item exists, create a new array with the quantity incremented
      if (existing) {
        return prev.map((p) =>
          p.id === id && JSON.stringify(p.options) === JSON.stringify(options)
            ? { ...p, qty: p.qty + 1 }
            : p
        );
      }
      // If the item doesn't exist, return the previous state unchanged
      return prev;
    });
  }, []);

  const decQty = useCallback((id, options = {}) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) =>
          p.id === id && JSON.stringify(p.options) === JSON.stringify(options)
      );
      if (existing) {
        return prev.map((p) =>
          p.id === id && JSON.stringify(p.options) === JSON.stringify(options)
            ? { ...p, qty: p.qty - 1 }
            : p
        );
      }
      return prev;
    });
  }, []);

  const removeFromCart = useCallback((id, options = {}) => {
    setCart((prev) =>
      prev.filter(
        (p) =>
          p.id !== id || JSON.stringify(p.options) !== JSON.stringify(options)
      )
    );
  }, []);

  // clear cart
  const clearCart = useCallback(() => setCart([]), []);

  // derived values
  // usememo to avoid recalculating on every render unless cart changes
  const totalItems = useMemo(
    () => cart.reduce((sum, p) => sum + p.qty, 0),
    [cart]
  );

  const totalMrpPrice = useMemo(
    () => cart?.reduce((s, p) => s + (p.original_price || 0) * p.qty, 0),
    [cart]
  );

  const totalDiscountPrice = useMemo(
    () => cart?.reduce((s, p) => s + (p.discount_amount || 0) * p.qty, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart?.reduce((s, p) => s + (p.discount_price || 0) * p.qty, 0),
    [cart]
  );

  // memoize the context value so consumers don't re-render unnecessarily

  // const memoizedValue = useMemo(createFn, deps);
  //createFn is a function that returns some computed value.
  //deps is an array of dependencies.
  //React will only re-run createFn when one of the values in deps changes.

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      incQty,
      decQty,
      clearCart,
      totalItems,
      totalMrpPrice,
      totalDiscountPrice,
      totalPrice,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      incQty,
      decQty,
      clearCart,
      totalItems,
      totalMrpPrice,
      totalDiscountPrice,
      totalPrice,
    ]
  );
  // passing the cart state and functions as the context value to app components
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
