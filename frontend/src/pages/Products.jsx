import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { Categories } from "../assets/assert";
import Slider from "@mui/material/Slider";

const Products = () => {
  //stores selected categories like shoes shirts
  const [selectedCategories, setSelectedCategories] = useState([]);
  //toggles between showing just 5 categories vs showing all
  const [showAll, setShowAll] = useState(false);

  const visibleCount = 5; // how many categories to show initially
  const visibleCategories = showAll //if showAll is true show all categories else show only first 5 at initial it false.
    ? Categories
    : Categories.slice(0, visibleCount);

  const handleToggle = (event) => {
    const value = event.target.name;
    setSelectedCategories(
      (prev) =>
        prev.includes(value)
          ? prev.filter((cat) => cat !== value) // remove if already selected
          : [...prev, value] // add if not selected
    );
  };

  //price slider
  const MAX = 10000;
  const MIN = 0;
  const marks = [
    {
      value: MIN,
      label: "",
    },
    {
      value: MAX,
      label: "",
    },
  ];
  const [val, setVal] = React.useState(MIN);
  const handlePriceSort = (_, newValue) => {
    setVal(newValue);
  };

  //Discount range
  const [discount, setDiscount] = useState([]);
  const discountRange = ["40", "50", "60", "70", "80"];
  const handleDiscount = (event) => {
    const value = (event.target.name);
    setDiscount(
      (prev) =>
        prev.includes(value)
          ? prev.filter((discountVal) => discountVal !== value) // remove if already selected
          : [...prev, value] // add if not selected
    );
  };

  // const [val, setVal] = React.useState(MIN);
  // const handleToggle = (_, newValue) => {
  //   setVal(newValue);
  // };

  // simulate DB filter call
  // const handleFilter = () => {
  //   console.log("Selected Categories:", selectedCategories);

  // Example: send to backend
  // fetch("/api/products?categories=" + selectedCategories.join(","))
  //   .then(res => res.json())
  //   .then(data => console.log(data));
  // };

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:8000/api/products")
  //     .then((result) => setProducts(result.data))
  //     .catch((error) => console.log(error));
  // }, []);

  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" mt={8}>
      <Box sx={{ border: "1px solid #e0e0e0", width: 250, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Filter by Category
        </Typography>
        <FormGroup>
          {visibleCategories.map((cat) => {
            const label = typeof cat === "string" ? cat : cat.name;
            return (
              <FormControlLabel
                key={label.replace(/\s+/g, "_")} //replace spaces with underscores for key
                control={
                  <Checkbox
                    checked={selectedCategories.includes(label)} //check if this category(lable) is in selectedCategories(categories) and returns bool.
                    onChange={handleToggle}
                    name={label}
                    color="#141514"
                  />
                }
                label={label}
              />
            );
          })}
        </FormGroup>
        {/* Show +N more only if not expanded */}
        {!showAll && Categories.length > visibleCount && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ cursor: "pointer", ml: 1, mt: 1 }}
            onClick={() => setShowAll(true)}
          >
            + {Categories.length - visibleCount} more
          </Typography>
        )}
        {/* Optionally: allow collapse back */}
        {showAll && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ cursor: "pointer", ml: 1, mt: 1 }}
            onClick={() => setShowAll(false)}
          >
            Show less
          </Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Price
        </Typography>
        <Box>
          <Slider
            marks={marks}
            step={10}
            value={val}
            valueLabelDisplay="auto"
            min={MIN}
            max={MAX}
            valueLabelFormat={(value) => `₹${value}`}
            onChange={handlePriceSort}
            color="default"
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              onClick={() => setVal(MIN)}
              sx={{ cursor: "pointer" }}
            >
              &#8377;{MIN}
            </Typography>
            <Typography
              variant="body2"
              onClick={() => setVal(MAX)}
              sx={{ cursor: "pointer" }}
            >
              &#8377;{MAX}+
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Discount Range
          </Typography>
          <FormGroup>
            {discountRange.map((rangeVal) => {
              const label = `${rangeVal} and above`;
              return (
                <FormControlLabel
                  key={label.replace(/\s+/g, "_")} //replace spaces with underscores for key
                  control={
                    <Checkbox
                      checked={discount.includes(rangeVal)} //check if this category(lable) is in discount and returns bool.
                      onChange={handleDiscount}
                      name={rangeVal}
                      color="#141514"
                    />
                  }
                  label={label}
                />
              );
            })}
          </FormGroup>
        </Box>
      </Box>

      <Box>
        <h1>products</h1>
      </Box>
    </Stack>
  );
};

export default Products;
