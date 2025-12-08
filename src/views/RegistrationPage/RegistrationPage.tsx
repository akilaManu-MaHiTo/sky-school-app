import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import leftLandingLeave from "../../assets/b_leaf_l.svg";
import rightLandingLeave from "../../assets/b_leaf_r.svg";
import ImageCarousel from "../../components/ImageCarousel";
import RegistrationForm from "./RegistrationForm";
import useCurrentUser from "../../hooks/useCurrentUser";
import PageLoader from "../../components/PageLoader";
import { useNavigate } from "react-router";
import index1 from "../../assets/new1.png";
import index2 from "../../assets/new2.png";
import index3 from "../../assets/new3.png";

function RegistrationPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const navigate = useNavigate();

  const { user, status } = useCurrentUser();
  const year = new Date().getFullYear();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (user) {
    navigate("/home");
  }

  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflowY: "hidden ",
      }}
    >
      <Stack
        direction={isMdUp ? "row" : "column"}
        sx={{ width: "100%", overflowY: "auto" }}
      >
        <Stack
          sx={{
            flex: isMdUp ? 3 : 1,
            backgroundColor: "#f2f2f2",
            height: isMdUp ? "100vh" : "auto",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant={isMdUp ? "h2" : "h3"}
            sx={{
              fontWeight: "700",
              color: "#525252",
              marginTop: "5rem",
              marginLeft: "1rem",
              marginRight: "1rem",
              textAlign: "center",
            }}
          >
            School Management System
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "600",
              color: "#525252",
              margin: "1rem",
              textAlign: "center",
            }}
          >
            {`copyright © ` +
              year +
              ` Sky Smart Technology, All Rights Reserved`}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "400",
              color: "#525252",
              textAlign: "center",
              marginLeft: "3rem",
              marginRight: "3rem",
              marginBottom: "1rem",
            }}
          >
            Our dedicated team is here to empower your school community with
            smart, intuitive digital solutions. We support your vision, guide
            you through our innovative school management features, and ensure
            you have the answers you need for academic and administrative
            excellence.
          </Typography>
          <ImageCarousel
            images={[
              { src: index1, alt: "Welcome" },
              { src: index2, alt: "Health & Safety" },
              { src: index3, alt: "Employee Engagement" },
            ]}
          />
        </Stack>
        <Stack sx={{ flex: isMdUp ? 2 : 1, justifyContent: "center" }}>
          <RegistrationForm />
        </Stack>
      </Stack>
      
    </Stack>
  );
}

export default RegistrationPage;
