import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import {
  Button,
  Divider,
  Stack,
  SvgIcon,
  TextField,
} from "@mui/material";
import { GoTag } from "react-icons/go";
import Dialogbox from "../components/Dialogbox";
import {useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

const Cart = () => {
  const theme = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQty,
    totalItems,
    totalMrpPrice,
    totalDiscountPrice,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  // const [applycoupon, setApplycoupon] = useState(false);
  const [open, setOpen] = useState(false);

  if (!cart.length) return <p>Your cart is empty</p>;
  console.log("Cart Items:", cart);
  console.log(totalPrice);
  return (
    <Stack
      direction={{ xs: "column", md: "row" }} // column on mobile, row on desktop
      justifyContent="space-between"
      alignItems={{ xs: "center", md: "flex-start" }}
      mt={2}
      px={{ xs: 2, md: 20 }}
    >
      <Box>
        {/* <h2>Cart ({totalItems})</h2> */}
        {cart.map((item) => (
         
          <Card
            key={item.id}
            sx={{ display: "flex", m: 1, border: "1px solid #ccc", cursor: "pointer" }}
            onClick={() => navigate(`/product/${item.slug}`)}
          >
            <CardMedia
              component="img"
              sx={{ width: 151, m: 1 }}
              image={item.thumbnail}
              alt={item.name}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" variant="h5">
                  {item.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  {item.description}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  size: {item.selected_size} qty: {item.qty}
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
                    Rs. {item.discount_price}
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
                    Rs. {item.original_price}
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
                    ({item.discount_percentage}% OFF)
                  </Typography>
                </Box>
              </CardContent>

              <Box sx={{ display: "flex", alignItems: "center", pl: 1, pb: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    removeFromCart(item.id),
                      toast.error("Product removed from cart");
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          </Card>
          // <div key={item.id}>
          //   <img src={item.thumbnail} alt={item.name} width={60} />
          //   <p>{item.name}</p>
          //   <p>₹{item.original_price}</p>
          //   <p>₹{item.description}</p>
          //   <input
          //     type="number"
          //     min="1"
          //     value={item.qty}
          //     onChange={(e) => updateQty(item.id, Number(e.target.value))}
          //   />
          //   <button onClick={() => removeFromCart(item.id)}>Remove</button>
          // </div>
        ))}

        <Button variant="contained" color="info" onClick={clearCart}>
          Clear Cart
        </Button>
      </Box>

      <Card
        sx={{
          minWidth: 360,
          border: "1px solid #ccc",
          p: 2,
          mt: 1,
          display: "flex",
          flexDirection: "column",

          mb: 1,
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
            color="success"
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
            PICE DETAILS ( {totalItems} items)
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
            <Typography>₹{totalMrpPrice}</Typography>
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
            <Typography color="success">- ₹{totalDiscountPrice}</Typography>
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
              ₹{totalPrice + 45}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Stack>
  );
};
export default Cart;
