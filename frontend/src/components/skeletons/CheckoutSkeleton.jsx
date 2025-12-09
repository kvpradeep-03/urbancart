import React from "react";
import { Box, Grid, Paper, Skeleton, Divider } from "@mui/material";

export default function CheckoutSkeleton() {
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
        {/* LEFT SIDE */}
        <Grid item xs={12} sm={7} md={8}>
          {/* Delivery Address */}
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2, sm: 2, md: 3 },
              mb: 3,
              bgcolor: "#fff",
              width: "100%",
            }}
          >
            <Skeleton width={160} height={26} sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Grid key={idx} item xs={12} sm={6}>
                  <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Payment Method */}
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: "#fff",
            }}
          >
            <Skeleton width={160} height={26} sx={{ mb: 2 }} />
            <Skeleton width={280} height={24} sx={{ mb: 1.5 }} />
            <Skeleton width={230} height={24} />
          </Paper>
        </Grid>

        {/* RIGHT SIDE - Order Summary */}
        <Grid item xs={12} sm={5} md={4}>
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
              <Skeleton width={160} height={26} sx={{ mb: 2 }} />
              <Divider sx={{ mb: 2 }} />

              {/* Items / Subtotal / Delivery */}
              {Array.from({ length: 3 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <Skeleton width="35%" height={22} />
                  <Skeleton width="20%" height={22} />
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Order Total */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Skeleton width="40%" height={26} />
                <Skeleton width="20%" height={26} />
              </Box>

              {/* Payment Button */}
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 3 }} />

              <Divider sx={{ mb: 2 }} />

              {/* Cart Item Label */}
              <Skeleton width={160} height={20} sx={{ mb: 2 }} />

              {/* Cart Item */}
              {[1].map((_, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", mb: 2, pb: 2, alignItems: "center" }}
                >
                  <Skeleton
                    variant="rectangular"
                    width={60}
                    height={60}
                    sx={{ borderRadius: 1, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton width="85%" height={18} sx={{ mb: 0.5 }} />
                    <Skeleton width="50%" height={16} sx={{ mb: 0.5 }} />
                    <Skeleton width="35%" height={16} />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
