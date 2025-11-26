// ViewProductSkeleton.jsx
import {
  Box,
  Stack,
  Skeleton,
  Grid,
  Button,
  Typography,
  Divider,
} from "@mui/material";

export default function ViewProductSkeleton() {
  return (
    <>
      {/* Main Wrapper */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: "center", md: "flex-start" }}
        mt={2}
        px={{ xs: 2, md: 6 }}
      >
        {/* LEFT — IMAGE SLIDER SKELETON */}
        <Box
          sx={{
            width: "100%",
            height: { xs: 300, sm: 300, md: 500 },
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 2,
            }}
          />
        </Box>

        {/* RIGHT — PRODUCT DETAILS */}
        <Box
          sx={{
            width: { xs: "100%", md: "45%" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Title */}
          <Skeleton variant="text" width="60%" height={28} />

          {/* Rating */}
          <Skeleton variant="rectangular" width={70} height={30} />

          {/* Description */}
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />

          {/* Price Row */}
          <Stack direction="row" spacing={2} mt={1}>
            <Skeleton variant="text" width={60} height={25} />
            <Skeleton variant="text" width={50} height={25} />
            <Skeleton variant="text" width={80} height={25} />
          </Stack>

          {/* Sizes */}
          <Stack direction="row" spacing={2} mt={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={50}
                height={35}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>

          {/* Add To Cart */}
          <Skeleton
            variant="rectangular"
            width={{ xs: "100%", sm: "60%", md: "50%" }}
            height={45}
            sx={{ borderRadius: 1, mt: 2 }}
          />

          {/* DELIVERY OPTIONS */}
          <Box>
            <Skeleton variant="text" width="40%" height={26} />

            <Stack direction="row" spacing={2} mt={1}>
              <Skeleton variant="rectangular" width={200} height={40} />
              <Skeleton variant="rectangular" width={100} height={40} />
            </Stack>

            <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />

            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="text"
                width="70%"
                height={20}
                sx={{ mt: 1 }}
              />
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Best Offers */}
            <Skeleton variant="text" width="30%" height={26} />
            <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1 }} />

            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="text"
                width="80%"
                height={20}
                sx={{ mt: 1 }}
              />
            ))}
          </Box>
        </Box>
      </Stack>

      {/* SIMILAR PRODUCTS HEADING */}
      <Divider sx={{ mt: { sm: "6vw", xs: "16vw" } }}>
        <Skeleton variant="text" width={200} height={30} />
      </Divider>

      {/* SIMILAR PRODUCTS GRID */}
      <Box sx={{ flexGrow: 1, p: { xs: 0, sm: 2 }, mt: 3, mb: 6 }}>
        <Grid
          container
          spacing={{ xs: 0, sm: 2, lg: 2 }}
          justifyContent="center"
        >
          {[1, 2, 3, 4].map((i) => (
            <Grid
              key={i}
              size={{ xs: 6, sm: 6, lg: 3 }}
              sx={{ px: { xs: 0, sm: 1 } }}
            >
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{ borderRadius: 2 }}
              />

              <Box sx={{ p: 1 }}>
                <Skeleton variant="text" width="80%" height={22} />
                <Skeleton variant="text" width="100%" height={18} />
                <Skeleton variant="text" width="40%" height={18} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
