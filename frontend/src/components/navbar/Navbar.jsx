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
import { Link } from "react-router-dom";

const drawerWidth = 240;
const navItems = [
  <CustomizedMenus />,
  <Link to="/cart" style={{ textDecoration: "none", color: "inherit" }}>
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
    >
      <SvgIcon
        component={GiShoppingBag}
        inheritViewBox
        sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
      />
      <Typography sx={{ textTransform: "none" }}>Bag</Typography>
    </Box>
  </Link>,
  <Box
    sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }}
  >
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
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <Typography variant="h6" sx={{ cursor: "pointer", my: 2 }}>
          UrbanCart
        </Typography>
      </Link>
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
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
          {/* Left Icon (mobile only) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon sx={{ fontSize: "1.5rem" }} />
          </IconButton>

          <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                cursor: "pointer",
                position: { xs: "absolute", sm: "static" }, // absolute only on mobile
                top: { xs: "50%", sm: "auto" }, // vertical center
                left: { xs: "50%", sm: "auto" }, // horizontal center
                transform: { xs: "translate(-50%, -50%)", sm: "none" }, // perfect centering
              }}
            >
              UrbanCart
            </Typography>
          </Link>

          {/* Right side container: Search + navItems */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              ml: "auto", // push to right
            }}
          >
            {/* Search only visible on desktop */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Search />
            </Box>

            {/* Nav items (desktop only) */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {navItems.map((item, index) => (
                <Button
                  key={index}
                  sx={{ bgcolor: "#fffefe", color: "#141514" }}
                >
                  {item}
                </Button>
              ))}
            </Box>
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
