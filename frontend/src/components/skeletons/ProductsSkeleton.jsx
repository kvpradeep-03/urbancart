import { Box, Grid, Skeleton, Stack, Divider } from "@mui/material";

export default function ProductsSkeleton() {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={0} mt={"auto"}>
      {/*LEFT FILTER SECTION (Desktop)*/}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          border: "1px solid #e0e0e0",
          width: 250,
          p: 2,
          flexShrink: 0,
          height: "calc(100vh - 64px)",
          position: "sticky",
          top: 64,
          overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Skeleton width="40%" height={30} />
        <Skeleton width="30%" height={20} sx={{ mt: 1 }} />

        <Box sx={{ mt: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={30} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Skeleton width="40%" height={28} />
        <Skeleton height={40} sx={{ mt: 2 }} />

        <Divider sx={{ my: 2 }} />

        <Skeleton width="60%" height={28} />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={30} sx={{ mt: 1 }} />
        ))}
      </Box>

      {/*MAIN CONTENT AREA*/}
      <Box sx={{ flexGrow: 1 }}>
        {/* MOBILE FILTER BAR */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            borderBottom: "1px solid #e0e0e0",
            position: "sticky",
            top: 60,
            zIndex: 20,
            background: "#fff",
            p: 1,
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
            <Skeleton width="40%" height={24} />
            <Divider orientation="vertical" flexItem />
            <Skeleton width="40%" height={24} />
          </Grid>
        </Box>

        {/*PRODUCT GRID SKELETON*/}
        <Box sx={{ p: { xs: 0, sm: 2 }, mb: 6, mt: 1 }}>
          <Grid
            container
            spacing={{ xs: 0, sm: 2, lg: 2 }}
            justifyContent="center"
          >
            {[...Array(10)].map((_, i) => (
              <Grid
                item
                key={i}
                xs={6}
                sm={6}
                lg={3}
                sx={{ px: { xs: 0, sm: 1 }, mb: 2 }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {/* Image */}
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={280}
                    sx={{ borderRadius: "6px 6px 0 0" }}
                  />

                  {/* Content */}
                  <Box sx={{ p: 1.5 }}>
                    <Skeleton width="70%" height={22} />
                    <Skeleton width="95%" height={16} sx={{ mt: 1 }} />
                    <Skeleton width="65%" height={16} />

                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Skeleton width={40} height={20} />
                      <Skeleton width={40} height={20} />
                      <Skeleton width={60} height={20} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Stack>
  );
}
