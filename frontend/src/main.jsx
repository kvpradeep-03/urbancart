import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { CssBaseline } from "@mui/material";
import { CartProvider } from "./context/CartContext.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CssBaseline />
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);
