import React, { useEffect } from "react";
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
import Auth from "./components/auth/Auth";
import ProfilePage from "./pages/ProfilePage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  const [showLogin, setShowLogin] = React.useState(false);
  
  return (
    <>
      {showLogin ? <Auth setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<Viewproducts />} />
            <Route
              path="/cart"
              element={<Cart setShowLogin={setShowLogin} />}
            />
            <Route path="/cart/dialog" element={<Dialogbox />} />
            <Route
              path="/profile"
              element={<ProfilePage setShowLogin={setShowLogin} />}
            />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route
              path="/reset-password/:uid/:token"
              element={<ResetPassword />}
            />
          </Routes>
        </ThemeProvider>
        <Footer />
      </div>
    </>
  );
};

export default App;
