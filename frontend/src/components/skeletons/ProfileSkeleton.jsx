import { Box, Card, CardContent, Skeleton } from "@mui/material";

export default function ProfileSkeleton() {
  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="circular" width={60} height={60} />
          <Skeleton width="40%" height={30} />
          <Skeleton width="60%" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Skeleton width="50%" height={30} />
          <Skeleton variant="rectangular" height={120} />
        </CardContent>
      </Card>
    </>
  );
}
