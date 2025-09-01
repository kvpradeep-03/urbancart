import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Products from "./pages/Products";
import Home from "./pages/Home";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;
