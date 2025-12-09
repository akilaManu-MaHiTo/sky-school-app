import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import leftLandingLeave from "../../assets/b_leaf_l.svg";
import rightLandingLeave from "../../assets/b_leaf_r.svg";
import ImageCarousel from "../../components/ImageCarousel";
import LoginForm from "./LoginForm";
import useCurrentUser from "../../hooks/useCurrentUser";
import PageLoader from "../../components/PageLoader";
import { useNavigate } from "react-router";
import index1 from "../../assets/pic1.png";
import index2 from "../../assets/pic2.png";

function LoginPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const navigate = useNavigate();

  const { user, status } = useCurrentUser();

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
            Welcome Back
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: "400",
              color: "#525252",
              textAlign: "center",
              marginLeft: "3rem",
              marginRight: "3rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            Our intelligent school platform brings teachers, students, and
            parents into one connected learning space. Students gain
            clear access to their progress through interactive report views, and
            parents stay informed with real-time insights into their child's
            academic journey.
          </Typography>
          <ImageCarousel
            images={[
              { src: index1, alt: "Welcome" },
              { src: index2, alt: "Health & Safety" },
            ]}
          />
        </Stack>
        <Stack sx={{ flex: isMdUp ? 2 : 1 }}>
          <LoginForm />
        </Stack>
      </Stack>
      
    </Stack>
  );
}

export default LoginPage;
