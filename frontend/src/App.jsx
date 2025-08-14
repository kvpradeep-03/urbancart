import React from 'react'
import { Routes, Route } from "react-router-dom";
import Navbar from './components/navbar/Navbar'
import Products from "./pages/Products";
import Banner from "./components/Banner";

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <Banner />
      <Routes>
        <Route path="/products" element={<Products />} />
      </Routes>
    </div>
  );
}

export default App
