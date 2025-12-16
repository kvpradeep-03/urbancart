import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import { Button, Divider, Stack, SvgIcon, TextField } from "@mui/material";
import { GoTag } from "react-icons/go";
import Dialogbox from "../components/Dialogbox";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EmptyCart from "../components/Emptycart";
import CartSkeleton from "../components/skeletons/CartSkeleton";
import { useAuth } from "../context/AuthContext";
import PleaseLogin from "../components/PleaseLogin";
import { Link } from "react-router-dom";

const Cart = ({ setShowLogin }) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  });
  const theme = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const {
    cart,
    loading,
    removeFromCart,
    incQty,
    decQty,
    clearCart,
    placeOrder,
  } = useContext(CartContext);

  const { isAuthenticated } = useAuth();

  // TODO: integrate this razopay while payment checkout and return their response to the placeorder endpoint that should sent the payment infos and order details in mail

  // const [applycoupon, setApplycoupon] = useState(false);
  const [open, setOpen] = useState(false);
  // console.log("cart items:", cart);

  if (!isAuthenticated()) {
    return <PleaseLogin onLoginClick={() => setShowLogin(true)} />;
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (!cart || cart.total_items === 0) {
    return <EmptyCart />;
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row", md: "row", lg: "row" }} // column on mobile, row on desktop
      justifyContent="space-between"
      alignItems={{
        xs: "center",
        sm: "flex-start",
        md: "flex-start",
        lg: "flex-start",
      }}
      m={2}
      px={{ xs: 0, md: 35 }}
    >
      <Box width={"100%"}>
        {cart?.items?.map((item) => (
          <Card
            key={item.id}
            sx={{
              display: "flex",
              m: 1,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/product/${item.slug}`)}
          >
            <CardMedia
              component="img"
              sx={{ width: { xs: 140, md: 130 }, m: 1 }}
              image={item.product.thumbnail}
              alt={item.product.name}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" variant="h5">
                  {item.product.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  {item.product.description}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  size: {item.selected_size.toUpperCase()} qty: {item.quantity}
                </Typography>

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
                    Rs. {item.product.discount_price}
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
                    Rs. {item.product.original_price}
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
                    ({item.product.discount_percentage}% OFF)
                  </Typography>
                </Box>
              </CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 0.5,
                  px: 0.5,
                  py: 0.5,
                  m: 1,
                  mt: 0,
                  borderRadius: 2,
                  width: "fit-content",
                }}
                onClick={(e) => e.stopPropagation()} // prevent card navigation
              >
                <SvgIcon
                  component={RemoveCircleOutlineIcon}
                  disabled={item.quantity <= 1}
                  inheritViewBox
                  sx={{
                    fontSize: 24,
                    cursor: "pointer",
                    color: "action.active",
                    "&:hover": { color: "error.main" },
                  }}
                  onClick={() => decQty(item.id, item.quantity)}
                />

                <Typography variant="body1" sx={{ mx: 1 }}>
                  {item.quantity}
                </Typography>

                <SvgIcon
                  component={AddCircleOutlineIcon}
                  inheritViewBox
                  sx={{
                    fontSize: 24,
                    cursor: "pointer",
                    color: "action.active",
                    "&:hover": { color: "success.main" },
                  }}
                  onClick={() => incQty(item.id, item.quantity)}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", pl: 1, pb: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id),
                      toast.error("Product removed from cart");
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Card>
        ))}

        {cart?.total_items > 0 && (
          <Button
            variant="contained"
            color="error"
            sx={{ mt: 2, ml: 1.5, mb: 2 }}
            onClick={() => {
              clearCart();
            }}
          >
            Clear Cart
          </Button>
        )}
      </Box>

      {cart?.total_items > 0 && (
        <Card
          sx={{
            minWidth: 360,
            border: "1px solid #ccc",
            p: 2,
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontSize: 14, fontWeight: 600 }}
          >
            Coupons
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center", // ensures vertical centering
              mb: 1,
              gap: 1,
            }}
          >
            <SvgIcon
              component={GoTag}
              inheritViewBox
              sx={{
                fontSize: { xs: 16, md: 18 }, // balanced sizes
              }}
            />
            <Typography variant="h5" sx={{ fontSize: 14, fontWeight: 600 }}>
              Apply Coupons
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => setOpen(true)}
            >
              Apply
            </Button>

            {/* React automatically passes whatever you put between the opening and
          closing tags as a prop named children. so we dont need to put them manually */}
            <Dialogbox
              open={open}
              onClose={() => setOpen(false)}
              title={"Apply Coupons"}
            >
              <TextField
                size="small"
                placeholder="Enter Coupon Code"
                sx={{
                  width: "400px",
                  mr: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#ccc", // default
                    },
                    "&:hover fieldset": {
                      borderColor: "#000", // hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000", // focus
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: "black", color: "white" }}
              >
                Check
              </Button>
            </Dialogbox>
          </Box>

          <Divider />
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: 14,
                fontWeight: 600,
                mb: 1,
              }}
            >
              PICE DETAILS ( {cart.total_items} items)
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                Total MRP
              </Typography>
              <Typography>₹{cart.total_mrp}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                Discount on MRP
              </Typography>
              <Typography color="success">- ₹{cart.total_discount}</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                Coupon Discount
              </Typography>
              <Typography color="error">apply coupon</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                }}
              >
                Delivery Charges
              </Typography>
              <Typography color="error">45</Typography>
            </Box>

            <Divider />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  mt: 2,
                }}
              >
                Total Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  mt: 2,
                }}
              >
                ₹{cart.total_price + 45}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="success"
            component={Link}
            to={`/checkout`}
          >
            Place Order
          </Button>
        </Card>
      )}
    </Stack>
  );
};
export default Cart;
