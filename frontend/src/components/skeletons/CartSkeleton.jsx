import React from "react";
import { Box, Card, Grid, Skeleton, Stack } from "@mui/material";

const CartSkeleton = () => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "center", md: "flex-start" }}
      m={2}
      px={{ xs: 0, md: 20 }}
      spacing={3}
    >
      {/* LEFT — CART ITEMS */}
      <Box width={"100%"}>
        {[1, 2].map((i) => (
          <Card
            key={i}
            sx={{
              display: "flex",
              p: 2,
              m: 1,
              border: "1px solid #e3e3e3",
              borderRadius: 2,
            }}
          >
            {/* Product Image */}
            <Skeleton
              variant="rectangular"
              sx={{ width: { xs: 120, sm: 140, md: 150 }, height: 140, mr: 2 }}
            />

            {/* Product Info */}
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="80%" height={22} />
              <Skeleton variant="text" width="40%" height={22} />

              {/* Price */}
              <Stack direction="row" spacing={2} mt={1}>
                <Skeleton variant="text" width={60} height={22} />
                <Skeleton variant="text" width={50} height={22} />
                <Skeleton variant="text" width={70} height={22} />
              </Stack>

              {/* Qty Buttons */}
              <Stack direction="row" spacing={2} mt={2}>
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="text" width={20} height={20} />
                <Skeleton variant="circular" width={28} height={28} />
              </Stack>

              <Skeleton
                variant="rectangular"
                width={100}
                height={32}
                sx={{ mt: 2 }}
              />
            </Box>
          </Card>
        ))}

        {/* CLEAR CART BUTTON */}
        <Skeleton
          variant="rectangular"
          width={120}
          height={40}
          sx={{ mt: 2, borderRadius: 1 }}
        />
      </Box>

      {/* RIGHT — PRICE SUMMARY */}
      <Card
        sx={{
          minWidth: { xs: "100%", md: 360 },
          border: "1px solid #e3e3e3",
          p: 3,
          borderRadius: 2,
        }}
      >
        <Skeleton variant="text" width={120} height={28} />

        <Skeleton
          variant="rectangular"
          width={"90%"}
          height={20}
          sx={{ my: 2 }}
        />

        {[1, 2, 3, 4].map((i) => (
          <Stack
            key={i}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ my: 1 }}
          >
            <Skeleton variant="text" width="40%" height={22} />
            <Skeleton variant="text" width="20%" height={22} />
          </Stack>
        ))}

        <Skeleton
          variant="rectangular"
          width={"100%"}
          height={48}
          sx={{ mt: 2 }}
        />
      </Card>
    </Stack>
  );
};

export default CartSkeleton;
