import React, { useContext, useEffect, useState } from "react";
import api from "../components/auth/axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Stack,
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import CheckoutSkeleton from "../components/skeletons/CheckoutSkeleton";

const CheckoutPage = () => {
  const {
    cart,
    loading,
    placeOrder,
    razorpayCreateOrder,
    razorpayVerifyPayment,
  } = useContext(CartContext);

  const navigate = useNavigate();
  const toast = useToast();
  const [shipping, setShipping] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_street: "",
    shipping_city: "",
    shipping_state: "",
    shipping_pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handlePayment = async () => {
    if (paymentMethod === "COD") {
      await placeCodOrder();
    } else {
      await razorpayPayment();
    }
  };

  const placeCodOrder = async () => {
    try {
      const formData = new FormData();
      Object.keys(shipping).forEach((f) => formData.append(f, shipping[f]));
      await placeOrder(formData);
      navigate(`/order-success/${res.data.order_id}`);
    } catch (error) {
      const errorMsg = error?.response?.data?.error;
      console.log(errorMsg);
    }
  };

  const razorpayPayment = async () => {
    const formData = new FormData();
    Object.keys(shipping).forEach((f) => formData.append(f, shipping[f]));

    const res = await razorpayCreateOrder(formData);

    const options = {
      key: res.data.key,
      amount: res.data.amount * 100,
      currency: "INR",
      name: "Urbancart",
      description: "Order Payment",
      order_id: res.data.razorpay_order_id,

      handler: async function (response) {
        const formData = new FormData();
        Object.keys(shipping).forEach((f) => formData.append(f, shipping[f]));

        formData.append("razorpay_order_id", response.razorpay_order_id);
        formData.append("razorpay_payment_id", response.razorpay_payment_id);
        formData.append("razorpay_signature", response.razorpay_signature);

        await razorpayVerifyPayment(formData);
        navigate(`/order-success/${res.data.razorpay_order_id}`);
      },

      prefill: {
        name: shipping.shipping_name,
        contact: shipping.shipping_phone,
      },
      theme: { color: "#008cffff" },
    };

    new window.Razorpay(options).open();
  };

  if (loading || !cart) return <CheckoutSkeleton />;

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh", width: "100%", py: 3 }}>
      <Grid
        container
        spacing={3}
        px={{ xs: 2, sm: 2, md: 18 }}
        sx={{
          flexDirection: { xs: "column", md: "row", sm: "row", lg: "row" },
        }}
      >
        {/* Left Side - Delivery Address & Payment Method */}
        <Grid item size={{ xs: 12, sm: 7, md: 8 }}>
          {/* Delivery Address Card */}
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2, sm: 2, md: 3 },
              mb: 3,
              bgcolor: "#fff",
              width: "100%",
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
            >
              Delivery Address
            </Typography>

            <Grid container spacing={2}>
              {Object.keys(shipping).map((key) => (
                <Grid item size={{ xs: 12, sm: 6 }} key={key}>
                  <TextField
                    fullWidth
                    size="small"
                    label={key
                      .replace("shipping_", "")
                      .replace("_", " ")
                      .toUpperCase()}
                    value={shipping[key]}
                    onChange={(e) =>
                      setShipping({ ...shipping, [key]: e.target.value })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Payment Method Card */}
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fff" }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
            >
              Payment Method
            </Typography>

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="razorpay"
                control={
                  <Radio
                    sx={{
                      color: "black",
                      "&.Mui-checked": {
                        color: "black",
                      },
                    }}
                  />
                }
                label="Credit / Debit Card / UPI (Razorpay)"
              />
              <FormControlLabel
                value="COD"
                control={
                  <Radio
                    sx={{
                      color: "black",
                      "&.Mui-checked": {
                        color: "black",
                      },
                    }}
                  />
                }
                label="Cash on Delivery"
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Right Side - Order Summary */}
        <Grid item size={{ xs: 12, sm: 5, md: 4 }}>
          <Box
            sx={{
              position: { xs: "relative", md: "sticky" },
              top: { md: "100px" },
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 2, md: 3 },
                bgcolor: "#fff",
              }}
            >
              <Typography
                variant="h5"
                sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
              >
                Order Summary
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Items:</Typography>
                  <Typography>{cart.total_items}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{cart.total_price}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Delivery Fee:</Typography>
                  <Typography>₹45</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  color="warning"
                  sx={{ fontSize: 18, fontWeight: 600 }}
                >
                  Order Total:
                </Typography>
                <Typography
                  variant="h5"
                  color="warning"
                  sx={{ fontSize: 18, fontWeight: 600 }}
                >
                  ₹{cart.total_price + 45}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  bgcolor: "#FF9900",
                  color: "#111",
                  "&:hover": { bgcolor: "#FF8C00" },
                }}
                onClick={handlePayment}
              >
                <Typography variant="h5" sx={{ fontSize: 16, fontWeight: 600 }}>
                  USE THIS PAYMENT METHOD
                </Typography>
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Cart Items */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                Items in your cart
              </Typography>

              {cart.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    mb: 2,
                    pb: 2,
                    borderBottom: "1px solid #f0f0f0",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <img
                    src={item.product.thumbnail}
                    width="60"
                    height="60"
                    style={{
                      borderRadius: 4,
                      marginRight: 12,
                      objectFit: "cover",
                    }}
                    alt={item.product.name}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontWeight={600}
                      fontSize="14px"
                      sx={{ mb: 0.5 }}
                    >
                      {item.product.name}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                    <Typography fontSize={14} fontWeight={600} sx={{ mt: 0.5 }}>
                      ₹{item.product.discount_price}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CheckoutPage;
