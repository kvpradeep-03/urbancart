import React from 'react'
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase"; 
import { styled, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  border: "1px solid black",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  "&:hover": {
  backgroundColor: alpha(theme.palette.common.white, 0.25),
  border: "1px solid #555"
},
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "40ch",
    
    },
  },
}));

const Search = () => {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const query = e.target.value;
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <SearchBar>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>

      <StyledInputBase
        placeholder="Search…"
        onChange={handleSearch}
        inputProps={{ "aria-label": "search" }}
      />
    </SearchBar>
  );
};



export default Search