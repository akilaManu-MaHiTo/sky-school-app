import { Box, Stack, Typography } from "@mui/material";
import useCurrentUser from "../../hooks/useCurrentUser";
import insightImage from "../../assets/welcomeInsight.png";
import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "../../api/OrganizationSettings/organizationSettingsApi";
import { hasSignedUrl } from "../Administration/SchoolManagement/schoolUtils";

function Insight() {
  const { user } = useCurrentUser();
  const { data: organizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });
  const logo = Array.isArray(organizationData?.logoUrl)
    ? organizationData?.logoUrl[0]
    : organizationData?.logoUrl;

  return (
    <Stack>
      <Typography
        variant="h3"
        align="center"
        sx={{ mt: 2, mb: 2, fontWeight: "bold", color: "var(--pallet-orange)" }}
      >
        {`Welcome ${user?.name || user?.userName}!`}
      </Typography>

      {hasSignedUrl(logo) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            component="img"
            src={logo.signedUrl}
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
        </Box>
      )}
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
