import React from "react";
import { SnackbarProvider, useSnackbar } from "notistack";

// This wraps your whole app
export const ToastProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {children}
    </SnackbarProvider>
  );
};

// Custom hook to use anywhere
export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (msg) =>
      enqueueSnackbar(msg, { variant: "success", autoHideDuration: 1000 }),
    error: (msg) =>
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 1000 }),
    warning: (msg) =>
      enqueueSnackbar(msg, { variant: "warning", autoHideDuration: 1000 }),
    info: (msg) =>
      enqueueSnackbar(msg, { variant: "info", autoHideDuration: 1000 }),
    default: (msg) =>
      enqueueSnackbar(msg, { variant: "default", autoHideDuration: 1000 }),
  };
};


// usage
// wrap your app with <ToastProvider> in App.jsx
// const toast = useToast();
// toast.success("This is a success message" {override options like duration});