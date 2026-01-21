import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  Button,
  Badge,
} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import { Categories } from "../assets/assert";
import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList"; // Filter icon
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; // Clear All icon
import Drawer from "@mui/material/Drawer";
import ProductListSkeleton from "../components/skeletons/ProductsSkeleton";
import Pagination from "@mui/material/Pagination";

const Products = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [products, setProducts] = useState([]);
  const [discount, setDiscount] = useState([]);
  const [loading, setLoading] = useState(true);
  //toggles between showing just 5 categories vs showing all
  const [showAll, setShowAll] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  //to indicate if any filter is active
  const [filterIsActive, setFilterIsActive] = useState(false);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  // for pre-selecting category from EmptyCart page
  const categoryFromUrl = queryParams.get("category");
  // for pre-selecting search term from Navbar search
  const searchTerm = queryParams.get("search") || "";

  const [selectedCategories, setSelectedCategories] = useState(
    categoryFromUrl ? [categoryFromUrl] : [],
  );

  const [searchQuery, setSearchQuery] = useState(searchTerm);

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  //price slider
  const MAX = 10000;
  const MIN = 500;
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

  const handlePriceSort = (_, newValue) => {
    setVal(newValue);
    // console.log(val);
  };
  const [val, setVal] = useState(MIN);
  const visibleCount = 5; // how many categories to show initially
  const visibleCategories = showAll //if showAll is true show all categories else show only first 5 at initial it false.
    ? Categories
    : Categories.slice(0, visibleCount);

  //fetch all products
  const fetchProducts = async (pageNumber) => {
    setLoading(true);

    const params = new URLSearchParams();

    //includes pagination
    params.append("page", pageNumber);

    //filters
    selectedCategories.forEach((cat) => params.append("category", cat));
    discount.forEach((d) => params.append("discount", d));
    if (val !== MIN) {
      params.append("price", val);
    }

    //search
    if (searchQuery.trim()) {
      params.append("search", searchQuery);
    }

    try {
      const res = await axios.get(`/api/products/?${params.toString()}`);
      setProducts(res.data.results);
      setCount(Math.ceil(res.data.count / 12));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, selectedCategories, discount, searchQuery]);
  
  useEffect(() => {
    const active =
      selectedCategories.length > 0 ||
      discount.length > 0 ||
      val !== MIN ||
      searchQuery.trim() !== "";

    setFilterIsActive(active);
  }, [selectedCategories, discount, val, searchQuery]);

  //sets page number for pagination
  const handlePageChange = (value) => {
    setPage(value);
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSelectedCategories([]);
    setDiscount([]);
    setVal(MIN);
    setFilterIsActive(false);
  };

  const handleToggle = (event) => {
    const value = event.target.name;
    setSelectedCategories(
      (prev) =>
        prev.includes(value)
          ? prev.filter((cat) => cat !== value) // remove if already selected
          : [...prev, value], // add if not selected
    );
  };

  //Discount range

  const discountRange = ["40", "50", "60", "70", "80"];
  const handleDiscount = (event) => {
    const value = event.target.name;
    setDiscount(
      (prev) =>
        prev.includes(value)
          ? prev.filter((discountVal) => discountVal !== value) // remove if already selected
          : [...prev, value], // add if not selected
    );
  };

  if (loading) {
    return <ProductListSkeleton />;
  }

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
        <Grid
          container
          spacing={{ xs: 0, sm: 2, lg: 2 }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
            Filters
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontSize: 14,
              fontWeight: 600,
              color: "error.main",
              cursor: "pointer",
            }}
            onClick={clearFilters}
          >
            Clear All
          </Typography>
        </Grid>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
            Price
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: "#212020",
              color: "#212020",
              textTransform: "none",
              fontWeight: 500,
              transition: "0.2s ease",

              "&:hover": {
                backgroundColor: "#212020",
                color: "#fff",
                borderColor: "#212020",
              },
            }}
            onClick={() => fetchProducts(page)}
          >
            Apply
          </Button>
        </Box>

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
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            borderBottom: "1px solid #e0e0e0",
            position: "sticky",
            top: 60,
            zIndex: 20,
            background: "#fff",
          }}
        >
          <Grid
            container
            alignItems="center"
            justifyContent="space-around"
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              py: 2,
              background: "#ffffff",
            }}
          >
            {/* FILTER BUTTON */}
            <Grid
              item
              xs={5}
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={() => setFilterOpen(true)} // if you have a drawer/panel
            >
              {filterIsActive ? (
                <Badge color="error" variant="dot">
                  <FilterListIcon sx={{ fontSize: 20, color: "#444" }} />
                </Badge>
              ) : (
                <FilterListIcon sx={{ fontSize: 20, color: "#444" }} />
              )}

              <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                Filter
              </Typography>
            </Grid>

            {/* VERTICAL DIVIDER */}
            <Divider orientation="vertical" flexItem />

            {/* CLEAR ALL BUTTON */}
            <Grid
              item
              xs={5}
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={clearFilters}
            >
              <DeleteOutlineIcon sx={{ fontSize: 20, color: "#d32f2f" }} />
              <Typography
                sx={{ fontSize: 15, fontWeight: 600, color: "error.main" }}
              >
                Clear All
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* filter for mobile view */}
        <Drawer
          anchor="left"
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          sx={{ display: { xs: "block", sm: "none" } }}
        >
          <Box sx={{ width: 260, p: 2 }}>
            <Grid
              container
              spacing={{ xs: 0, sm: 2, lg: 2 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
                Filters
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "error.main",
                  cursor: "pointer",
                }}
                onClick={clearFilters}
              >
                Clear All
              </Typography>
            </Grid>
            <Divider sx={{ my: 2 }} />
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
                Price
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#212020",
                  color: "#212020",
                  textTransform: "none",
                  fontWeight: 500,
                  transition: "0.2s ease",

                  "&:hover": {
                    backgroundColor: "#212020",
                    color: "#fff",
                    borderColor: "#212020",
                  },
                }}
                onClick={() => fetchProducts(page)}
              >
                Apply
              </Button>
            </Box>

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
        </Drawer>

        <Box sx={{ flexGrow: 1, p: { xs: 0, sm: 2 }, mb: 6, mt: -1 }}>
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
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 2,
                  }}
                >
                  <CardActionArea
                    component={Link}
                    to={`/product/${product.slug}`}
                    sx={{ flexGrow: 1 }}
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
                    <CardContent sx={{ flexGrow: 1 }}>
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

        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          {products.length > 0 && (
            <Stack spacing={2}>
              <Pagination
                count={count}
                page={page}
                variant="outlined"
                shape="rounded"
                size="large"
                onChange={(event, value) => handlePageChange(value)}
              />
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default Products;
