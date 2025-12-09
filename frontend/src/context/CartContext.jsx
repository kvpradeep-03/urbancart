// src/context/CartContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api from "../components/auth/axios";
export const CartContext = createContext(null);
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

// cartProvider component wraps the app and provides cart values to any nested components in app
// the children is a react prop that represents whatever you wrap inside <CartProvider> in your app
export const CartProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState({
    id: null,
    items: [],
    total_items: 0,
    total_mrp: 0,
    total_discount: 0,
    total_price: 0,
  });

  const toast = useToast();
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const result = await api
        .get("/api/cart/", { withCredentials: true })
        .finally(() => setLoading(false));
      setCart(result.data);
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      toast.error("Something went wrong while fetching cart");
    }
  };
  const addToCart = async (productId, size) => {
    try {
      await api.post(
        "/api/cart/add/",
        {
          product_id: productId,
          selected_size: size.id, // IMPORTANT
        },
        { withCredentials: true }
      );
      fetchCart(); // Refresh cart UI
    } catch (err) {
      toast.error("something went wrong, please try again");
    }
  };

  const incQty = async (itemId, currentQty) => {
    await api.post(
      `/api/cart/update/${itemId}/`,
      {
        quantity: currentQty + 1,
      },
      { withCredentials: true }
    );
    fetchCart();
    toast.success("Product quantity updated");
  };

  const decQty = async (itemId, currentQty) => {
    if (currentQty <= 1) return;
    await api.post(
      `/api/cart/update/${itemId}/`,
      {
        quantity: currentQty - 1,
      },
      { withCredentials: true }
    );
    fetchCart();
    toast.success("Product quantity updated");
  };

  const removeFromCart = async (itemId) => {
    await api.delete(`/api/cart/remove/${itemId}/`, {
      withCredentials: true,
    });
    fetchCart();
  };

  const clearCart = async () => {
    try {
      await api.delete("/api/cart/clear/", { withCredentials: true });
      setCart([]); // clear local state after backend is cleared
      fetchCart();
      toast.success("Cart cleared successfully");
    } catch (err) {
      toast.error("Error clearing cart");
    }
  };

const placeOrder = async (formData) => {
  try {
    const res = await api.post("/api/order/place/", formData, {
      withCredentials: true,
    });
    setCart([]);
    fetchCart();
    toast.success("Your Order has been Placed Successfully, Thank you!");
    return res;
  } catch (err) {
    const msg = err?.response?.data?.error || "Order failed";
    toast.error(msg);
   
  }
};


const razorpayCreateOrder = async (formData) => {
  try {
    const res = await api.post("/api/payment/create-order/", formData, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    const msg = err?.response?.data?.error || "Unable to create order";
    toast.error(msg);
  
  }
};


const razorpayVerifyPayment = async (formData) => {
  try {
    const res = await api.post("/api/payment/verify/", formData, {
      withCredentials: true,
    });
    setCart([]);
    fetchCart();
    return res;
  } catch (err) {
    const msg = err?.response?.data?.error || "Payment verification failed";
    toast.error(msg);
    throw err;
  }
};


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
      loading,
      razorpayCreateOrder,
      razorpayVerifyPayment,
      decQty,
      clearCart,
      placeOrder,
    }),
    [
      cart,
      addToCart,
      razorpayCreateOrder,
      razorpayVerifyPayment,
      loading,
      removeFromCart,
      incQty,
      decQty,
      clearCart,
      placeOrder,
    ]
  );
  // passing the cart state and functions as the context value to app components
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
