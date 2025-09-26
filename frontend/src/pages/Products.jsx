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
  Card,
  CardMedia,
  Grid,
} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import { Categories } from "../assets/assert";
import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";

//TODO: FIX CARD SIZE ISSUE ON WHILE DISPLAYING ONE OR TWO PRODUCTS IN THE GRID
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
  console.log(selectedCategories);

  //price slider
  const MAX = 10000;
  const MIN = 700;
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
  const [val, setVal] = useState(MIN);
  const handlePriceSort = (_, newValue) => {
    setVal(newValue);
    console.log(val);
  };

  //Discount range
  const [discount, setDiscount] = useState([]);
  const discountRange = ["40", "50", "60", "70", "80"];
  const handleDiscount = (event) => {
    const value = event.target.name;
    setDiscount(
      (prev) =>
        prev.includes(value)
          ? prev.filter((discountVal) => discountVal !== value) // remove if already selected
          : [...prev, value] // add if not selected
    );
  };

  //fetch products from backend
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products")
      .then((result) => setProducts(result.data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    //fetch filtered products
    try {
      const category_query = selectedCategories
        .map((cat) => `category=${cat}`)
        .join("&");
      const price_query = `price=${val}`;
      const discount_query = discount.map((d) => `discount=${d}`).join("&");
      axios
        .get(`http://localhost:8000/api/products/?${category_query}&${price_query}&${discount_query}`)
        .then((result) => setProducts(result.data))
        .then((error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  }, [selectedCategories, val, discount]);

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={0} mt={"auto"}>
      <Box
        sx={{
          display: { xs: "none", sm: "block" }, // hide on xs screens
          border: "1px solid #e0e0e0",
          width: 250,
          p: 2,
          flexShrink: 0, // prevent shrinking
          height: "calc(100vh - 64px)", // full viewport height minus header (adjust 64px to your header height)
          position: "sticky",
          top: 64, // match your header height so it sticks below navbar
          overflowY: "auto",

          // Hide scrollbar
          "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
          msOverflowStyle: "none", // IE/Edge
          scrollbarWidth: "none", // Firefox
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
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
                slotProps={{
                  typography: {
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
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
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
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
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
            Discount Range
          </Typography>
          <FormGroup>
            {discountRange.map((rangeVal) => {
              const label = `${rangeVal}% and above`;
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
                  slotProps={{
                    typography: {
                      fontWeight: 300,
                      fontFamily: "Poppins, sans-serif",
                    },
                  }}
                />
              );
            })}
          </FormGroup>
        </Box>
      </Box>

      <Box>
        <Box sx={{ flexGrow: 1, p: { xs: 0, sm: 2 }, mb: 6, mt: 3 }}>
          <Grid
            container
            spacing={{ xs: 0, sm: 2, lg: 2 }}
            justifyContent="center"
          >
            {products.map((product) => (
              <Grid
                size={{ xs: 6, sm: 6, lg: 3 }}
                key={product.id}
                sx={{ px: { xs: 0, sm: 1 } }}
              >
                <Card sx={{ Width: "100%" }}>
                  <CardActionArea
                    component={Link}
                    to={`/product/${product.slug}`}
                  >
                    <CardMedia
                      component="img"
                      image={product.thumbnail}
                      alt={product.name}
                      sx={{
                        objectFit: "cover",
                        width: "100%",
                        height: 280, // Adjust these values
                      }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {product.description.length > 60
                          ? product.description.slice(0, 60) + "..."
                          : product.description}
                      </Typography>

                      {/* Price Section */}
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {/* Discounted Price */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: "10px", md: "12px", lg: "16px" },
                            fontWeight: 500,
                          }}
                        >
                          Rs. {product.discount_price}
                        </Typography>

                        {/* Original Price with strikethrough */}
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "text.secondary",
                            fontSize: { xs: "10px", md: "12px", lg: "16px" },
                          }}
                        >
                          Rs. {product.original_price}
                        </Typography>

                        {/* Discount info */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "error.main",
                            fontSize: { xs: "10px", md: "12px", lg: "16px" },
                            fontWeight: "small",
                          }}
                        >
                          ({product.discount_percentage}% OFF)
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Stack>
  );
};

export default Products;
