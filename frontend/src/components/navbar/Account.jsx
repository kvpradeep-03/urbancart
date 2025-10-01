import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import { IoLogInOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import Box from '@mui/material/Box';
import { SvgIcon } from "@mui/material";
import { TfiPackage } from "react-icons/tfi";
import { GrMapLocation } from "react-icons/gr";
import { Link } from 'react-router-dom';
 

export default function CustomizedMenus({setShowLogin}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Box
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="text"
        disableElevation
        onClick={(e) => {
          e.stopPropagation(); // ✅ prevents Drawer from closing
          handleClick(e);
        }}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          bgcolor: "#fffefe",
          color: "#141514",
          fontSize: { xs: 16, sm: 20 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <IoPersonOutline />
        <Typography sx={{ textTransform: "none" }}>Profile</Typography>
      </Box>
      <Menu
        disablePortal // ✅ keep inside Drawer DOM
        elevation={1}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id="demo-customized-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose} // important so clicking outside closes
      >
        <MenuItem
          disableRipple
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // left align text
            paddingY: 1,
          }}
        >
          <Typography fontWeight={600} sx={{ textTransform: "none" }}>
            Welcome
          </Typography>
          <Typography color="initial" sx={{ textTransform: "none" }}>
            To access account and manage orders
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setShowLogin(true);
          }}
          disableRipple
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SvgIcon
            component={IoLogInOutline}
            inheritViewBox
            sx={{ fontSize: { xs: 16, sm: 26 }, display: "block" }}
          />
          <Typography sx={{ textTransform: "none" }}>Login/Signup</Typography>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleClose}
          disableRipple
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SvgIcon
            component={TfiPackage}
            inheritViewBox
            sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
          />
          <Typography sx={{ textTransform: "none" }}>Orders</Typography>
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          disableRipple
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <SvgIcon
            component={GrMapLocation}
            inheritViewBox
            sx={{ fontSize: { xs: 16, sm: 20 }, display: "block" }}
          />
          <Typography sx={{ textTransform: "none" }}>
            Track My Orders
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}