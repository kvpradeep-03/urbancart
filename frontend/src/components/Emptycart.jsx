// src/pages/EmptyCart.jsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Paper,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 4,
          p: { xs: 3, md: 6 },
          borderRadius: 2,
        }}
      >
        {/* Illustration */}
        <Box
          sx={{
            width: { xs: "100%", sm: 360, md: 420 },
            maxWidth: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: { xs: 0, md: 2 },
          }}
        >
          <Box
            component="img"
            src="../../public/emptycart_illu.svg"
            alt="Empty cart"
            sx={{
              width: { xs: "80%", sm: "100%" },
              height: "auto",
              objectFit: "contain",
              filter: "saturate(0.95)",
            }}
          />
        </Box>

        {/* Text & Actions */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
          <Stack spacing={1} alignItems={{ xs: "center", md: "flex-start" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: 0.2 }}
            >
              Your cart is empty
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              Looks like you haven’t added anything to your cart yet. Browse our
              categories and find items you’ll love.
            </Typography>

            {/* Action buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2, width: { xs: "100%", sm: "auto" } }}
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingBagOutlinedIcon />}
                component={RouterLink}
                to="/products"
                sx={{ px: 3, backgroundColor: "#2f2f41" }}
              >
                Continue Shopping
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<HistoryOutlinedIcon />}
                component={RouterLink}
                to="/orders"
                size="large"
                sx={{
                  borderColor: "grey.300",
                  color: "text.primary",
                }}
              >
                View Orders
              </Button>
            </Stack>

            {/* small helper row */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 2, color: "text.secondary", fontSize: 13 }}
            >
              <ShoppingCartOutlinedIcon fontSize="small" />
              <Typography variant="caption" color="text.secondary">
                Tip: Add items to your cart from product pages or collections.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Suggested categories / placeholder */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Popular categories
        </Typography>

        <Stack direction="row" spacing={0} sx={{ flexWrap: "wrap", gap: 2 }}>
          {[
            "T-Shirts",
            "Casual Shirts",
            "Jeans",
            "Formal shoes",
            "Sweat Shirts",
            "Watches",
            "skincare",
            "Perfumes",
            "Formal Trousers",
            "Ethnic Wear",
            "sarees",
            "sports shoes",
          ].map((c) => (
            <Button
              key={c}
              variant="outlined"
              component={RouterLink}
              to={`/products?category=${encodeURIComponent(c)}`}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#000",
                color: "#000",
                "&:hover": {
                  borderColor: "#000",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              {c}
            </Button>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default EmptyCart;
