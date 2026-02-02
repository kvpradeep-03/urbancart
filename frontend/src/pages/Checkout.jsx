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
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const {
    cart,
    loading,
    placeOrder,
    razorpayCreateOrder,
    razorpayVerifyPayment,
  } = useContext(CartContext);
  const [placingOrder, setPlacingOrder] = React.useState(false);

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
      setPlacingOrder(true);
      const formData = new FormData();
      Object.keys(shipping).forEach((f) => formData.append(f, shipping[f]));
      const res = await placeOrder(formData);
      // console.log("COD placeOrder res: ", res);
      navigate(`/order-success/${res.data.order_id}`);
    } catch (error) {
      setPlacingOrder(false);
      const errorMsg = error?.response?.data?.error;
      // console.error("COD Order Error: ", errorMsg);
    }
  };

  const razorpayPayment = async () => {
    try {
      setPlacingOrder(true);
      const formData = new FormData();
      Object.keys(shipping).forEach((f) => formData.append(f, shipping[f]));

      const res = await razorpayCreateOrder(formData);
      // console.log("Razorpay createOrder res: ", res);
      const options = {
        key: res.data.key,
        amount: res.data.amount * 100,
        currency: "INR",
        name: "Urbancart",
        description: "Order Payment",
        order_id: res.data.razorpay_order_id,

        handler: async function (response) {
          try {
            const verifyData = new FormData();

            Object.keys(shipping).forEach((f) =>
              verifyData.append(f, shipping[f]),
            );

            verifyData.append("razorpay_order_id", response.razorpay_order_id);
            verifyData.append(
              "razorpay_payment_id",
              response.razorpay_payment_id,
            );
            verifyData.append(
              "razorpay_signature",
              response.razorpay_signature,
            );

            const paymentRes = await razorpayVerifyPayment(verifyData);
            // console.log("Razorpay verifyPayment res: ", paymentRes);
            navigate(`/order-success/${response.razorpay_order_id}`);
          } catch (err) {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setPlacingOrder(false); // user closed popup
          },
          escape: true,
          backdropclose: false,
        },
        // cloudflare on render doesn't support window location change it blocks the window.opener if its cross orgin domains
        // Razorpay mock bank page requires access to window.opener.
        // when `redirect: true` Razorpay don't tries to finish the flow or to call this handler or window.opener instead it opens its own hosted payment page, The bank mock page (Success / Failure buttons) is rendered inside Razorpay’s domain
        // after completion of razorpays inner flow it redirected to `callback_url` which forces to hit our backend to verify payment endpoint and show success / failure accordingly.
        redirect: true,
        callback_url: res.data.callback_url,
        redirect: false,

        prefill: {
          name: shipping.shipping_name,
          contact: shipping.shipping_phone,
        },
        theme: { color: "#008cffff" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      setPlacingOrder(false); // order creation failed
    }
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
                disabled={placingOrder}
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
