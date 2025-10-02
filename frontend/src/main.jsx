import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { CssBaseline } from "@mui/material";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider} from "./context/AuthContext.jsx"
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CssBaseline />
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
