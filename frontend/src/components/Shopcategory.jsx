import { Box, Card, CardMedia, Divider, Grid, Typography } from "@mui/material";
import React from "react";
import { categories } from "../assets/assert";
import { Link } from "react-router-dom";

const Shopcategory = () => {
  return (
    <>
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Typography
          variant="h4"
          color="#3e4152"
          sx={{
            fontWeight: 300,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
          }}
        >
          Shop By Category
        </Typography>
      </Divider>

      <Box sx={{ flexGrow: 1, p: 2, mt: "2vw" }}>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((category) => (
            <Grid item xs={3} sm={3} md={3} lg={2} key={category.id}>
              <Link
                to={`/products/`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  sx={{
                    borderRadius: "12px",
                    boxShadow: 3,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={category.img}
                    alt={category.name}
                    sx={{
                      height: { xs: 150, sm: 200, md: 250 }, // responsive smaller height
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Shopcategory;
