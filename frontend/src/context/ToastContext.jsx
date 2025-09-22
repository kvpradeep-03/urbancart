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
      enqueueSnackbar(msg, { variant: "success", autoHideDuration: 2000 }),
    error: (msg) =>
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 2000 }),
    warning: (msg) =>
      enqueueSnackbar(msg, { variant: "warning", autoHideDuration: 2000 }),
    info: (msg) =>
      enqueueSnackbar(msg, { variant: "info", autoHideDuration: 2000 }),
    default: (msg) =>
      enqueueSnackbar(msg, { variant: "default", autoHideDuration: 2000 }),
  };
};


// usage
// wrap your app with <ToastProvider> in App.jsx
// const toast = useToast();
// toast.success("This is a success message" {override options like duration});