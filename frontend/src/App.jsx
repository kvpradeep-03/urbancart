import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Products from "./pages/Products";
import Home from "./pages/Home";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Footer from "./components/Footer";
import Viewproducts from "./pages/Viewproducts";
import Cart from "./pages/Cart";
import Dialogbox from "./components/Dialogbox";
import { ToastProvider } from "./context/ToastContext";
import Auth from "./components/auth/Auth";
 

const App = () => {
  const [showLogin, setShowLogin] = React.useState(false);
  return (
    <>
      {showLogin ? <Auth setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider maxSnack={3} autoHideDuration={3000}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<Viewproducts />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/cart/dialog" element={<Dialogbox />} />
            </Routes>
          </ToastProvider>
        </ThemeProvider>
        <Footer />
      </div>
    </>
  );
};

export default App;
