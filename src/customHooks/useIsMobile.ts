import { Theme, useMediaQuery } from "@mui/material";

function useIsMobile() {
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  // const isSmallMonitor = useMediaQuery((theme: Theme) =>
  //   theme.breakpoints.down(500)
  // );

  const isSmallMonitor = useMediaQuery("(min-width:1024px) and (max-width:1440px)");

  return { isMobile, isTablet, isSmallMonitor };
}

export default useIsMobile;
