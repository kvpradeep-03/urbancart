import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import api from "../components/auth/axios";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`api/order/details/${orderId}/`);
      setOrder(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Typography mt={5} textAlign="center">
        Order not found
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Alert
          severity="success"
          sx={{ mb: 4, width: {sm:"60%",md:"60%"}, justifyContent: "center" }}
        >
          Your order placed successfully. Thankyou
        </Alert>
      </Box>

      {/* Order Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Order Summary
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid spacing={1}>
          <Grid item xs={6}>
            <Typography>Order No:</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>{order.order_id}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>Date:</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>{order.order_date}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>Payment Method:</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>{order.payment_method}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>Total:</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>₹{order.total_amount}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Details */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Order Details
        </Typography>
        <Divider sx={{ my: 2 }} />

        {order.items.map((item) => (
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            spacing={1}
            key={item.id}
            sx={{ mb: 1 }}
          >
            <Grid item xs={6}>
              <img
                src={`http://127.0.0.1:8000${item.thumbnail}`}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  objectFit: "cover",
                }}
              />
            </Grid>

            <Grid item xs={6} textAlign="right">
              <Typography>
                {item.quantity} x ₹{item.price}
              </Typography>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 2 }} />

        <Grid container>
          <Grid item xs={6}>
            <Typography fontWeight="bold">Total:</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography fontWeight="bold">₹{order.total_amount}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Billing Address */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Billing Address
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography>{order.address.name}</Typography>
        <Typography>{order.address.phone}</Typography>
        <Typography>{order.address.street}</Typography>
        <Typography>
          {order.address.city}, {order.address.state} - {order.address.pincode}
        </Typography>
      </Paper>
      <Box display="flex" justifyContent="flex-end" sx={{ mt: "24px" }}>
        <Button variant="contained" color="warning" href="/profile">
          View Orders
        </Button>
      </Box>
    </Box>
  );
};

export default OrderSuccess;
