// Viewproducts.jsx
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  IconButton,
  SvgIcon,
  CardMedia,
  CardActionArea,
  Card,
  Grid,
  CardContent,
  Avatar,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { CiDeliveryTruck } from "react-icons/ci";
import { TbPointFilled } from "react-icons/tb";
import { GoTag } from "react-icons/go";
import { IoStar } from "react-icons/io5";

export default function Viewproducts() {
  const { slug } = useParams();
  const { addToCart, cart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});
  // for similar products
  const [products, setProducts] = useState([]);
  // check if product is already in cart if yes sets true else false , doing this to prevent null error on initial render
  const inCart = product ? cart.some((p) => p.id === product.id) : false;

  // for similar products
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products")
      .then((result) => setProducts(result.data))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:8000/api/products/${slug}/`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // derive sizes from product AFTER product is set
  const sizesArray = product?.size ? product.size.split(" ") : [];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;
console.log(selectedSize)
  const NextArrow = ({ onClick }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        zIndex: 2,
      }}
    >
      <ArrowForwardIos />
    </IconButton>
  );

  const PrevArrow = ({ onClick }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        left: "10px",
        transform: "translateY(-50%)",
        zIndex: 2,
      }}
    >
      <ArrowBackIos />
    </IconButton>
  );

  const settings = {
    /**
     * react-slick is a popular React wrapper around the Slick Carousel library.
     * It handles all the heavy work: sliding, autoplay, dots, responsiveness, etc.
     * We configure it using the settings object
     */
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // turn arrows back on
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }} // column on mobile, row on desktop
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: "center", md: "flex-start" }}
        mt={2}
        px={{ xs: 2, md: 6 }}
      >
        {/*Product Images */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            position: "relative",
          }}
        >
          <Slider {...settings}>
            {product.images.map((img) => (
              <Box
                key={img.id}
                sx={{
                  height: { xs: "300px", sm: "300px", md: "500px" },
                  backgroundImage: `url(${img.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 2,
                }}
              />
            ))}
          </Slider>
        </Box>

        {/*Product Details*/}
        <Box
          sx={{
            width: { xs: "100%", sm: "90%", md: "45%" },
            mx: { xs: "auto", md: 0 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box>
            <Typography gutterBottom variant="h6" component="div">
              {product.name}
            </Typography>
            <Button
              variant="outlined"
              color="success"
              sx={{ alignItems: "center", width: "10%" }}
            >
              {product.ratings}
              <SvgIcon
                component={IoStar}
                inheritViewBox
                sx={{
                  fontSize: { xs: 16, md: 16 }, // balanced sizes
                  ml: 0.5,
                  mb: 0.5,
                }}
              />
            </Button>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
              {product.description}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, md: 2 },
                justifyContent: "flex-start",
                mt: 2,
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

            <Stack direction="row" spacing={2} mt={2}>
              {sizesArray.length > 0 ? (
                sizesArray.map((size, index) => (
                  <Button
                    variant="outlined"
                    key={index}
                    onClick={() =>
                      setSelectedSize((prev) => ({
                        ...prev,
                        [product.id]: size,
                      }))
                    } // set clicked one
                    sx={{
                      bgcolor: "#fffefe",
                      color: "black",
                      border: "1px solid #bdbdbd",
                      fontFamily: "poppins",
                      fontWeight: 300,
                      cursor: "pointer",
                      "&:hover": {
                        border: "1px solid",
                        borderColor: "error.main",
                      },
                      ...(selectedSize[product.id] === size && {
                        border: "1px solid",
                        borderColor: "error.main",
                      }),
                    }}
                  >
                    <Typography sx={{ fontSize: 14 }}>{size}</Typography>
                  </Button>
                ))
              ) : (
                <Typography sx={{ color: "#888" }}>
                  No sizes available
                </Typography>
              )}
            </Stack>

            <Button
              variant="contained"
              color="warning"
              sx={{
                width: { xs: "100%", sm: "60%", md: "50%" },
                alignSelf: { xs: "center", md: "flex-start" },
                mt: 4,
              }}
              onClick={() =>
                addToCart(product, { selected_size: selectedSize[product.id] })
              }
            >
              {inCart ? "Add one more" : "Add to cart"}
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center", // ensures vertical centering
                mb: 1,
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={500}
                sx={{ m: 0 }} // remove extra margins
              >
                DELIVERY OPTIONS
              </Typography>

              <SvgIcon
                component={CiDeliveryTruck}
                inheritViewBox
                sx={{
                  fontSize: { xs: 24, md: 24 }, // balanced sizes
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Enter pincode"
                sx={{ width: "200px" }}
              />
              <Button variant="contained" color="error">
                Check
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Please enter PIN code to check delivery time & Pay on Delivery
              Availability
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                100% Original Products
              </ListItem>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                Pay on delivery might be available
              </ListItem>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                Easy 7 days returns and exchanges
              </ListItem>
            </List>
            <Divider sx={{ my: 3 }} />
            {/* Best Offers */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center", // ensures vertical centering
                mb: 1,
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={500}
                sx={{ m: 0 }} // remove extra margins
              >
                BEST OFFERS
              </Typography>

              <SvgIcon
                component={GoTag}
                inheritViewBox
                sx={{
                  fontSize: { xs: 18, md: 20 }, // balanced sizes
                }}
              />
            </Box>
            {/* First Offer */}
            <Typography variant="body1" fontWeight={500} color="error">
              Best Price: Rs. {product.discount_price - 100}
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                Applicable on: Orders above Rs. 750 (only on first purchase)
              </ListItem>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                Coupon code:{" "}
                <Typography
                  variant="bold"
                  color="error"
                  ml={1}
                  fontWeight={600}
                >
                  URBANSAVE
                </Typography>
              </ListItem>
              <ListItem sx={{ p: 0, mb: 0.5 }}>
                <SvgIcon
                  component={TbPointFilled}
                  inheritViewBox
                  sx={{
                    fontSize: 10,
                    mr: 1,
                  }}
                />{" "}
                Coupon Discount: 25% off (Your total saving:{" "}
                {product.discount_price - product.discount_price * 0.25})
              </ListItem>
            </List>
            <Typography
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer", mb: 2 }}
            >
              View Eligible Products
            </Typography>
            {/* HDFC Discount */}
            <Typography fontWeight={500}>
              10% Discount on HDFC Bank Credit Card.
            </Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              <SvgIcon
                component={TbPointFilled}
                inheritViewBox
                sx={{
                  fontSize: 10,
                  mr: 1,
                }}
              />{" "}
              Min Spend ₹750, Max Discount ₹5,000.
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer", mb: 2 }}
            >
              Terms & Condition
            </Typography>
            {/* EMI */}
            <Typography fontWeight={500}>EMI option available</Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              <SvgIcon
                component={TbPointFilled}
                inheritViewBox
                sx={{
                  fontSize: 10,
                  mr: 1,
                }}
              />{" "}
              EMI starting from Rs.43/month
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer" }}
            >
              View Plan
            </Typography>
          </Box>
        </Box>
      </Stack>
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Typography
          variant="h4"
          color="#3e4152"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          Similar Products
        </Typography>
      </Divider>

      <Box sx={{ flexGrow: 1, p: { xs: 0, sm: 2 }, mt: 3, mb: 6 }}>
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
                    height="280"
                    image={product.thumbnail}
                    alt={product.name}
                    sx={{ objectFit: "cover", width: "100%" }}
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
    </>
  );
}
