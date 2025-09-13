// Viewproducts.jsx
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { CiDeliveryTruck } from "react-icons/ci";
import { TbPointFilled } from "react-icons/tb";
import { GoTag } from "react-icons/go";
import { IoStar } from "react-icons/io5";

export default function Viewproducts() {
  const { slug } = useParams(); // 1
  const [product, setProduct] = useState(null); // 2
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext); // 3

  useEffect(() => {
    // 4
    let mounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:8000/api/products/${slug}/`) // 5
      .then((res) => {
        if (mounted) setProduct(res.data); // 6
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError("Failed to load product");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    }; // cleanup if component unmounts
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;
  console.log(product);

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
                height: { xs: "300px", sm: "400px", md: "500px" },
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
              mt: 2
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

          <Button
            variant="contained"
            color="warning"
            sx={{
              width: { xs: "100%", sm: "60%", md: "50%" },
              alignSelf: { xs: "center", md: "flex-start" },
              mt: 4
            }}
            onClick={() => addToCart(product)}
          >
            Add to Bag
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
              <Typography variant="bold" color="error" ml={1} fontWeight={600}>
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
          <Typography variant="body2" sx={{ ml: 2, }}>
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
  );
}
