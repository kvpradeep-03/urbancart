import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `'Poppins', sans-serif`,
  },
  palette: {
    primary: {
      main: "#fffefe", // background color (very light)
      contrastText: "#141514", // text color that appears on top of `main`
    },
  },
});

export default theme;
