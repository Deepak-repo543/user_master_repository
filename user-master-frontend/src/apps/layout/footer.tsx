
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Powered by
      </Typography>
      <Box
        component="img"
        src="/favicon-512x512.png"
        alt="User Master"
        sx={{
          width: 22,
          height: 30,
          objectFit: "contain",
          display: "block",
        }}
      />
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} User Master
      </Typography>
    </Box>
  );
};

export default Footer;