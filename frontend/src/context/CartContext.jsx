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
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, ...options, qty: p.qty + qty } : p
        );
      }
      return [...prev, { ...product, ... options, qty }];
    });
  }, []);

  // remove full item by id
  const removeFromCart = useCallback(
    (id) => setCart((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  // update quantity for an item (ensure qty >= 1)
  const updateQty = useCallback(
    (id, qty) =>
      setCart((prev) =>
        prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
      ),
    []
  );

  // clear cart
  const clearCart = useCallback(() => setCart([]), []);

  // derived values
  // usememo to avoid recalculating on every render unless cart changes
  const totalItems = useMemo(() => cart.reduce((s, p) => s + p.qty, 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((s, p) => s + (p.discount_price || 0) * p.qty, 0),
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
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
    ]
  );
  // passing the cart state and functions as the context value to app components
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
