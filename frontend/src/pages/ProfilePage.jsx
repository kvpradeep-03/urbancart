import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { TfiPackage } from "react-icons/tfi";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";
import NoOrders from "../components/NoOrders";
import PleaseLogin from "../components/PleaseLogin";

export default function ProfilePage({ setShowLogin }) {
  const { user, editUserProfile, isAuthenticated, loading } = useAuth();

  // Loading Skeleton
  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated()) {
    return <PleaseLogin onLoginClick={() => setShowLogin(true)} />;
  }

  // If authenticated but missing nested data
  if (!user || !user.user) {
    return <ProfileSkeleton />;
  }

  const userInfo = user?.user;
  const orders = user?.orders || [];

  // Hooks must ALWAYS be top-level, not conditional
  const [editing, setEditing] = useState(false);

  // SAFE initial form values (no user dependency)
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    address: "",
  });

  // Populate form ONLY after user is available
  useEffect(() => {
    if (user) {
      setForm({
        username: userInfo.username || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        city: userInfo.city || "",
        state: userInfo.state || "",
        address: userInfo.address || "",
      });
    }
  }, [userInfo]);

  // Status Color Handler
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveChanges = async () => {
    await editUserProfile(form);
    setEditing(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1100px", mx: "auto" }}>
      {/* PROFILE CARD */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item>
              <Avatar sx={{ width: 70, height: 70, bgcolor: "#878e94ff" }}>
                {userInfo.username?.[0]?.toUpperCase()}
              </Avatar>
            </Grid>

            <Grid item xs>
              <Typography variant="h6">My Profile</Typography>
              <Typography variant="body2">
                Manage your account details
              </Typography>
            </Grid>

            <Grid item>
              {!editing ? (
                <Button
                  variant="contained"
                  sx={{ color: "#fffefe", bgcolor: "#141514" }}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="contained"
                  sx={{ color: "#fffefe", bgcolor: "#141514" }}
                  onClick={saveChanges}
                >
                  Save
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {!editing ? (
            <Grid container spacing={2}>
              {[
                { label: "UserName", value: userInfo.username },
                { label: "Email ID", value: userInfo.email },
                { label: "Mobile Number", value: userInfo.phone },
                { label: "City", value: userInfo.city },
                { label: "State", value: userInfo.state },
                { label: "Address", value: userInfo.address },
              ].map((row, index) => (
                <Grid
                  size={{ xs: 12 }}
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    py: 1.5,
                    px: { xs: 0, md: 15 },
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: "40%", minWidth: "130px", flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: "#444" }}>
                      {row.label}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ color: "#333", wordBreak: "break-word" }}>
                      {row.value && row.value !== "" ? (
                        row.value
                      ) : (
                        <span style={{ color: "#777" }}>- not added -</span>
                      )}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2} justifyContent={"center"}>
              {["username", "email", "phone", "city", "state", "address"].map(
                (field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <TextField
                      fullWidth
                      name={field}
                      label={field.toUpperCase()}
                      value={form[field]}
                      onChange={handleChange}
                    />
                  </Grid>
                )
              )}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ORDERS */}
      <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 20 }, mb: 2 }}>
        Your Orders <TfiPackage style={{ verticalAlign: "middle" }} />
      </Typography>

      {orders.length === 0 ? (
        <NoOrders />
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight="bold">
                  Order ID: {order.order_id}
                </Typography>

                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                />
              </Box>

              <Typography variant="body2">
                {new Date(order.order_date).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <List>
                {order.items?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={`http://localhost:8000${item.product.thumbnail}`}
                        sx={{ width: 80, height: 90, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Price: ₹{item.price}
                          </Typography>
                          <Typography variant="body2">
                            Qty: {item.quantity}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
              <Typography>Total: ₹{order.total_amount}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
