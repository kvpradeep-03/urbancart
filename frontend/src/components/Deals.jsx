import React from "react";
import { Box, Divider, Typography, Card, CardMedia } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { banner_slot_1 } from "../assets/assert";
import { banner_slot_2 } from "../assets/assert";
import { banner_slot_3 } from "../assets/assert";
import { Link } from "react-router-dom";

const settings = {
  dots: true,
  infinite: true,
  autoplay: true,
  speed: 500,
  slidesToShow: 1, // base value
  slidesToScroll: 1,
  arrows: false,
  centerMode: true,
  variableWidth: true, // default for large screens
  responsive: [
    {
      breakpoint: 1024, // tablets
      settings: {
        slidesToShow: 2,
        variableWidth: false, // disable on tablet
        centerMode: false,
      },
    },
    {
      breakpoint: 600, // mobile
      settings: {
        slidesToShow: 1,
        variableWidth: false, // disable on mobile
        centerMode: false,
      },
    },
  ],
};

// console.log(" window.innerWidth Value = " + window.innerWidth);

const Deals = () => {
  return (
    <>
      {/* RISING STARS */}
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Typography
          variant="h4"
          color="#3e4152"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          RISING STARS
        </Typography>
      </Divider>

      <Slider {...settings}>
        {banner_slot_1.map((banner) => (
          <Box
            key={banner.id}
            sx={{
              px: 1.5,
              width: { xs: 180, sm: 220, md: 250 }, // FIXED width per slide
              display: "inline-block", // important
              mt: { sm: "2vw", xs: "12vw" },
              mb: 0,
            }}
          >
            <Link
              to={`/products/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: 3,
                  overflow: "hidden",
                }}
              >
                <CardMedia
                  component="img"
                  image={banner.img}
                  alt={banner.title}
                  sx={{
                    height: { xs: 300, sm: 350, md: 350 }, // smaller on mobile
                    objectFit: "cover",
                  }}
                />
              </Card>
            </Link>
          </Box>
        ))}
      </Slider>

      {/* LUXE GRAND REDUCTION DEALS */}
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Typography
          variant="h4"
          color="#3e4152"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          LUXE GRAND REDUCTION DEALS
        </Typography>
      </Divider>

      <Slider {...settings}>
        {banner_slot_2.map((banner) => (
          <Box
            key={banner.id}
            sx={{
              px: 1.5,
              width: { xs: 180, sm: 220, md: 250 }, // FIXED width per slide
              display: "inline-block", // important
              mt: { sm: "2vw", xs: "12vw" },
            }}
          >
            <Link
              to={`/products/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: 3,
                  overflow: "hidden",
                  height: "100%", // makes all cards equal height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  image={banner.img}
                  alt={banner.title}
                  sx={{
                    height: { xs: 300, sm: 350, md: 350 }, // smaller on mobile
                    objectFit: "cover",
                  }}
                />
              </Card>
            </Link>
          </Box>
        ))}
      </Slider>

      {/* Grand Global Brands */}
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Typography
          variant="h4"
          color="#3e4152"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          Grand Global Brands
        </Typography>
      </Divider>

      <Slider {...settings}>
        {banner_slot_3.map((banner) => (
          <Box
            key={banner.id}
            sx={{
              px: 1.5,
              width: { xs: 180, sm: 220, md: 250 }, // FIXED width per slide
              display: "inline-block", // important
              mt: { sm: "2vw", xs: "12vw" },
            }}
          >
            <Link
              to={`/products/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: 3,
                  overflow: "hidden",
                  height: "100%", // makes all cards equal height
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  image={banner.img}
                  alt={banner.title}
                  sx={{
                    height: { xs: 300, sm: 350, md: 350 }, // smaller on mobile
                    objectFit: "cover",
                  }}
                />
              </Card>
            </Link>
          </Box>
        ))}
      </Slider>
    </>
  );
};

export default Deals;
