import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const ForgetPassword = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setError("");
    initiatePassReset(email);
  };

  const initiatePassReset = async (email) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/auth/reset-password/",
        { email: email }
      );
      setSuccessMsg(res.data.message);
      setLoading(false);
    } catch (err) {
      toast.error("Error sending reset link");
    }
  };
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        justifyContent: "center",
        background: "#f5f5f5",
        p: 2,
      }}
    >
      {successMsg && (
        <Alert
          severity="success"
          sx={{
            position: "absolute",
            top: "10%",
            width: { sm: "60%", md: "60%" },
            justifyContent: "center",
          }}
        >
          {successMsg}
        </Alert>
      )}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          position: "absolute",
          top: "20%",
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Forget Password
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: "gray" }}>
          Enter your registered email. We will send you a link to reset your
          password.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              textTransform: "none",
              py: 1.2,
              color: "#fffefe",
              bgcolor: "#141514",
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#ffffff" }} />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgetPassword;
