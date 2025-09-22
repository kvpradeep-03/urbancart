import React from "react";
import { Button } from "@mui/material";
import { useSnackbar } from "notistack";

const Toastbutton = ({
  toastMessage,
  variant = "default",
  children,
  ...rest
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = (e) => {
    if (toastMessage) {
      enqueueSnackbar(toastMessage, { variant });
    }
    if (rest.onClick) rest.onClick(e); // still allow custom click handler
  };

  return (
    <Button {...rest} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default Toastbutton;
