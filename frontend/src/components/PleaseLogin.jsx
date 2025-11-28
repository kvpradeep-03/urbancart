import React from "react";
import { Box, Typography, Button } from "@mui/material";

const PleaseLogin = ({ onLoginClick }) => {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      {/* Illustration */}
      <Box
        component="img"
        src="/pleaseLogin_illu .png" // place the generated image here
        alt="Please login"
        sx={{
          width: { xs: "80%", sm: "40%" },
          height: "auto",
          mt: { xs: "60%", sm: "5%" },
          objectFit: "contain",
          filter: "saturate(0.95)",
        }}
      />

      {/* Text */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        Please login to continue
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: "gray" }}>
        You need an account to access this section.
      </Typography>

      {/* CTA Button */}
      <Button
        variant="contained"
        size="medium"
        onClick={onLoginClick}
        sx={{
          textTransform: "none",
          px: 4,
          py: 1,
          mb: { xs: "70%", sm: "10%" },
          color: "#fffefe",
          bgcolor: "#141514",
        }}
      >
        Login
      </Button>
    </Box>
  );
};

export default PleaseLogin;
