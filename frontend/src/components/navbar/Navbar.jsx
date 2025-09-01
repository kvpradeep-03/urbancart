import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CustomizedMenus from "./Account";
import { GiShoppingBag } from "react-icons/gi";
import { SvgIcon } from "@mui/material";
import { BsShopWindow } from "react-icons/bs";
import Search from "./Search";
 

const drawerWidth = 240;
const navItems = [
  <CustomizedMenus />,
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,cursor: "pointer"}}>
    <SvgIcon
      component={GiShoppingBag}
      inheritViewBox
      sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
    />
    <Typography sx={{ textTransform: "none" }}>Bag</Typography>
  </Box>,
  <Box sx={{ display: "flex", alignItems: "center",cursor: "pointer" , gap: 1 }}>
    <SvgIcon
      component={BsShopWindow}
      inheritViewBox
      sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
    />
    <Typography sx={{ textTransform: "none" }}>Become a Seller</Typography>
  </Box>,
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        UrbanCart
      </Typography>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        sx={{
          bgcolor: "#fffefe",
          color: "#141514",
        }}
        component="nav"
      >
        <Toolbar sx={{ position: "relative" }}>
          {/* Left Icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon sx={{ fontSize: "1.5rem" }} />
          </IconButton>

          {/* Title */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              // Default (desktop): normal flow
              flexGrow: { xs: 0, sm: 1 },
              // Mobile: absolute center
              position: { xs: "absolute", sm: "static" },
              left: { xs: "50%", sm: "auto" },
              transform: { xs: "translateX(-50%)", sm: "none" },
            }}
          >
            UrbanCart
          </Typography>
          {/* Search - Show only on sm and above */}
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Search />
          </Box>
          {/* Right Navigation Buttons */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" }, // flex instead of block
              alignItems: "center", // vertical center
              gap: 1, // space between buttons/icons
              ml: "auto",
            }}
          >
            {navItems.map((item, index) => (
              <Button key={index} sx={{ bgcolor: "#fffefe", color: "#141514" }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};

export default Navbar;
