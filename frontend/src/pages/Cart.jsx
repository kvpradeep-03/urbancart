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
import { Button } from "@mui/material";

const Cart = () => {
  const theme = useTheme();
  const { cart, removeFromCart, updateQty, totalItems, totalPrice, clearCart } =
    useContext(CartContext);

  if (!cart.length) return <p>Your cart is empty</p>;
  console.log("Cart Items:", cart);
console.log(totalPrice);
  return (
    <div>
      <h2>Cart ({totalItems})</h2>
      {cart.map((item) => (
        <Card key={item.id} sx={{ display: "flex" }}>
          <CardMedia
            component="img"
            sx={{ width: 151 }}
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
                onClick={() => removeFromCart(item.id)}
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
      <h3>Total: ₹{totalPrice}</h3>
      <Button variant="contained" color="info" onClick={clearCart}>
        Clear Cart
      </Button>
    </div>
  );
};
export default Cart;
