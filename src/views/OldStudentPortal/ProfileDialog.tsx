import React from "react";
import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  Zoom,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { OldStudent } from "../../api/oldStudentsApi";
import useIsMobile from "../../customHooks/useIsMobile";

const getInitials = (student: OldStudent) => {
  if (student.nameWithInitials) {
    const parts = student.nameWithInitials.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return student.name.charAt(0).toUpperCase();
};

const DetailRow: React.FC<{
  label: string;
  value?: string | null;
}> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: "0.65rem",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
};

type ProfileDialogProps = {
  student: OldStudent | null;
  open: boolean;
  onClose: () => void;
};

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  student,
  open,
  onClose,
}) => {
  const theme = useTheme();
  if (!student) return null;

  const { isMobile, isTablet } = useIsMobile();

  const occ = student.old_occupations[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          overflow: "hidden",
          maxWidth: "100%",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#f3f3f3ff",
          height: isMobile ? 80 : 100,
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "black",
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          ml: isMobile ? 0 : 3,
          mt: "-40px",
          px: isMobile ? 2 : isTablet ? 4 : 6,
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        <Avatar
          src={student.profileImage ?? undefined}
          sx={{
            width: 100,
            height: 100,
            fontSize: 28,
            fontWeight: 600,
            bgcolor: "#0a66c2",
            mb: 3,
            color: "#fff",
            border: `3px solid ${theme.palette.background.paper}`,
          }}
        >
          {getInitials(student)}
        </Avatar>
      </Box>

      <DialogContent
        sx={{
          pt: 1.5,
          pb: isMobile ? 3 : 4,
          px: isMobile ? 2 : isTablet ? 4 : 10,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ lineHeight: 1.3, textAlign: isMobile ? "center" : "left" }}
        >
          {student.nameWithInitials || student.name}
        </Typography>

        {occ && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: isMobile ? "center" : "left" }}
          >
            {occ.occupation} at {occ.companyName}
          </Typography>
        )}
        {occ && (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ textAlign: isMobile ? "center" : "left" }}
          >
            {occ.city}, {occ.country}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          About
        </Typography>
        <Stack direction="row" flexWrap="wrap" sx={{ gap: 2, mb: 3 }}>
          <Box sx={{ width: isMobile ? "100%" : "calc(50% - 8px)" }}>
            <DetailRow label="Full Name" value={student.name} />
          </Box>
          <Box sx={{ width: isMobile ? "100%" : "calc(50% - 8px)" }}>
            <DetailRow label="Email" value={student.email} />
          </Box>
          <Box sx={{ width: isMobile ? "100%" : "calc(50% - 8px)" }}>
            <DetailRow label="Mobile" value={student.mobile} />
          </Box>
          <Box sx={{ width: isMobile ? "100%" : "calc(50% - 8px)" }}>
            <DetailRow label="Registered" value={student.dateOfRegister} />
          </Box>
        </Stack>

        {student.old_universities.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Education
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {student.old_universities.map((uni, idx) => (
                <Stack key={uni.id ?? idx} direction="row" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: "#f3f2ef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="text.secondary"
                    >
                      {uni.universityName.charAt(0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {uni.universityName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {uni.degree}, {uni.faculty}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.disabled"
                    >
                      {uni.yearOfAdmission} - {uni.yearOfGraduation} &middot;{" "}
                      {uni.city}, {uni.country}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </>
        )}

        {student.old_occupations.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Experience
            </Typography>
            <Stack spacing={2}>
              {student.old_occupations.map((o, idx) => (
                <Stack key={o.id ?? idx} direction="row" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: "#f3f2ef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <BusinessIcon
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {o.occupation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.companyName}
                    </Typography>
                    {o.description && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5, color: "text.secondary" }}
                      >
                        {o.description}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.disabled"
                    >
                      {o.city}, {o.country} &middot; Since{" "}
                      {o.dateOfRegistration}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
