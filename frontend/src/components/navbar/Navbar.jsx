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
import { BsCart3 } from "react-icons/bs";
import { Badge, SvgIcon } from "@mui/material";
import { BsShopWindow } from "react-icons/bs";
import Search from "./Search";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

const Navbar = ({ setShowLogin }) => {
  const { cart } = useContext(CartContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);

  const navItems = [
    <CustomizedMenus setShowLogin={setShowLogin} />,
    <Link to="/cart" style={{ textDecoration: "none", color: "inherit" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <Badge
          badgeContent={cart?.total_items ?? 0}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 10,
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <SvgIcon
            component={BsCart3}
            inheritViewBox
            sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
          />
        </Badge>
        <Typography
          sx={{
            textTransform: "none",
          }}
        >
          Cart
        </Typography>
      </Box>
    </Link>,
  ];

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawerWidth = 240;

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
          {!showMobileSearch && (
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
          )}
          {/* mobile Search Icon */}
          <IconButton
            sx={{
              display: { xs: showMobileSearch ? "none" : "block", sm: "none" },
              alignItems: "center",
              ml: 41,
              mt: 0.5,
            }}
            onClick={() => setShowMobileSearch(true)}
          >
            <SearchIcon
              sx={{
                bgcolor: "#fffefe",
                color: "#141514",
                fontSize: 24,
              }}
            />
          </IconButton>

          {/* Mobile Search Bar (expanded) */}
          {showMobileSearch && (
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                alignItems: "center",
                width: "100%",
                gap: 1,
              }}
            >
              <Search />
              <Typography
                sx={{ cursor: "pointer", fontSize: 16, fontWeight: 600 }}
                onClick={() => setShowMobileSearch(false)}
              >
                Cancel
              </Typography>
            </Box>
          )}

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
