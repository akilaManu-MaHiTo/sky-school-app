import { Box, Stack, Typography } from "@mui/material";
import useCurrentUser from "../../hooks/useCurrentUser";
import insightImage from "../../assets/welcomeInsight.png";

function Insight() {
  const { user } = useCurrentUser();

  return (
    <Stack>
      <Typography
        variant="h3"
        align="center"
        sx={{ mt: 2, mb: 2, fontWeight: "bold", color: "var(--pallet-orange)" }}
      >
        {`Welcome ${user?.name || user?.userName}!`}
      </Typography>
      <Box
        component="img"
        src={insightImage}
        alt="Under Development"
        sx={{
          height: "auto",
          width: "60vw",
          maxHeight: "50vh",
          objectFit: "contain",
          justifySelf: "center",
          alignSelf: "center",
        }}
      />
      <Typography
        variant="body1"
        align="center"
        sx={{ mt: 2, color: "var(--pallet-main-blue)" }}
      >
        View real-time insights on Sky Smart Tech Sample Web Site, collection
        efficiency, and trends.
      </Typography>
    </Stack>
  );
}

export default Insight;
