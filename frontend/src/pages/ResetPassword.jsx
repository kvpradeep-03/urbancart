import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom"; // to read token from URL
import { useToast } from "../context/ToastContext";
import axios from "axios";

const ResetPassword = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const { uid } = useParams();
  const { token } = useParams();
  const [new_password, setnew_Password] = useState("");
  const [confirm_new_password, setconfirm_new_password] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!new_password || !confirm_new_password) {
      setError("All fields are required");
      return;
    }
    if (new_password !== confirm_new_password) {
      setError("Passwords do not match");
      return;
    }

    resetPassword(uid, token, new_password, confirm_new_password);
  };

  const resetPassword = async (
    uid,
    token,
    new_password,
    confirm_new_password
  ) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/reset-password/confirm/",
        {
          uid,
          token,
          new_password,
          confirm_new_password,
        }
      );

      setError("");
      setSuccessMsg(res.data.message);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const backendErrors = err?.response?.data;

      if (backendErrors?.new_password) {
        setError(backendErrors.new_password[0]);
      } else if (backendErrors?.token) {
        setError(backendErrors.token);
      } else if (backendErrors?.error) {
        setError(backendErrors.error);
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        alignItems: "center",
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
            justifyContent: "center",
            width: { sm: "60%", md: "60%" },
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
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={new_password}
            error={Boolean(error)}
            onChange={(e) => setnew_Password(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirm_new_password}
            onChange={(e) => setconfirm_new_password(e.target.value)}
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

export default ResetPassword;
