// BannerCarousel.jsx
import React from "react";
import Slider from "react-slick";
import { Box, Typography } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Banner() {
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
    arrows: false,
  };

  const banners = [
    {
      id: 1,
      img: "../../public/banner_img_1.webp",
      title: "Welcome to Our Store",
      subtitle: "Find the best products here",
    },
    {
      id: 2,
      img: "../../public/banner_img_2.webp",
      title: "Big Sale Today",
      subtitle: "Up to 50% off on selected items",
    },
    {
      id: 3,
      img: "../../public/banner_img_3.webp",
      title: "New Arrivals",
      subtitle: "Check out the latest trends",
    },
  ];

  return (
    <>
    
      <Box sx={{ width: "100%", position: "relative" }}>
        <Slider {...settings}>
          {/* We pass settings to <Slider> and map over the banners array */}
          {banners.map((banner) => (
            <Box
              key={banner.id}
              sx={{
                position: "relative",
                height: { xs: "400px", sm: "400px", md: "500px" },
                backgroundImage: `url(${banner.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mt: { xs: 7, sm: 8 },
              }}
            >
              {/* Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  textAlign: "center",
                  px: { xs: 2, sm: 4 }, // responsive padding
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2.5rem", md: "3rem" }, // smaller on mobile
                  }}
                >
                  {banner.title}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: { xs: "0.9rem", sm: "1.2rem", md: "1.5rem" },
                  }}
                >
                  {banner.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>
    </>
  );
}
