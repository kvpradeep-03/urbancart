import { Box, Typography, Button } from "@mui/material";

const NoOrders = () => {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
      }}
    >
      <Box
        component="img"
        src="../../public/noorders_illu.png"
        alt="Empty cart"
        sx={{
          width: { xs: "60%", sm: "40%" },
          height: "auto",
          objectFit: "contain",
          filter: "saturate(0.95)",
        }}
      />

      <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
        No Orders Yet
      </Typography>

      <Typography sx={{ color: "text.secondary", mt: 1 }}>
        Looks like you haven’t placed any orders.
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 3, bgcolor: "#141514", color: "#fffefe" }}
        href="/products"
      >
        Start Shopping
      </Button>
    </Box>
  );
};

export default NoOrders;
