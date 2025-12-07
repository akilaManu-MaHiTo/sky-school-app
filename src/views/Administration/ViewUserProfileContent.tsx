import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Badge,
  Box,
  CircularProgress,
  colors,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import useIsMobile from "../../customHooks/useIsMobile";
import { EmployeeType, updateUserProfileImage, User } from "../../api/userApi";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import queryClient from "../../state/queryClient";
import { enqueueSnackbar } from "notistack";
import { DrawerUpdateButtons } from "../../components/ViewProfileDataDrawer";
import UpdateUserProfile from "./UpdateUserProfileDialog";
import useCurrentUser from "../../hooks/useCurrentUser";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ProfileImage from "../../components/ProfileImageComponent";
import PasswordResetDialog from "./OpenPasswordResetDiaolg";
import ResetEmailDialog from "./OpenEmailResetDialog";
import CustomButton from "../../components/CustomButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import theme from "../../theme";
import AddOrEditAcademicDetailsDialog from "./AcademicDetails/AddOrEditAcademicDetailsDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { deleteAcademicDetail } from "../../api/OrganizationSettings/academicDetailsApi";
import { format } from "date-fns";

function ViewUserContent({ selectedUser }: { selectedUser: User }) {
  const { isTablet, isMobile } = useIsMobile();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user } = useCurrentUser();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const statusColor = selectedUser?.availability ? "#44b700" : "#f44336";

  const { mutate: profileUpdateMutation, isPending } = useMutation({
    mutationFn: updateUserProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Profile update failed", { variant: "error" });
    },
  });

  const saveImage = () => {
    if (imageFile) {
      profileUpdateMutation({ id: selectedUser.id, imageFile });
    }
  };
  const [openViewProfileDrawer, setOpenViewProfileDrawer] = useState(false);
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const [openEditUserPasswordResetDialog, setOpenEditUserPasswordResetDialog] =
    useState(false);
  const [openEditUserEmailResetDialog, setOpenEditUserEmailResetDialog] =
    useState(false);

  const [openAcademicDetailsDialog, setOpenAcademicDetailsDialog] =
    useState(false);

  const [editAcademicDetails, setEditAcademicDetails] = useState(null);
  const [openDeleteAcademicDetailsDialog, setOpenDeleteAcademicDetailsDialog] =
    useState(false);

  const transformProfileData = useMemo(() => {
    if (!selectedUser || !selectedUser.userProfile) return [];

    const grouped: Record<string, any> = selectedUser.userProfile.reduce(
      (acc, profile) => {
        const year = profile.academicYear;
        if (!acc[year]) acc[year] = [];
        acc[year].push(profile);
        return acc;
      },
      {} as Record<string, any>
    );
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      const yearA = Number(a[0]);
      const yearB = Number(b[0]);
      if (!Number.isNaN(yearA) && !Number.isNaN(yearB)) {
        return yearB - yearA;
      }
      return b[0].localeCompare(a[0]);
    });

    return sortedEntries.map(([year, profiles]) => ({
      year,
      profiles,
    }));
  }, [selectedUser]);

  const {
    mutate: deleteAcademicDetailMutation,
    isPending: isAcademicDetailDeleting,
  } = useMutation({
    mutationFn: deleteAcademicDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      enqueueSnackbar("Academic Detail Delete Successfully!", {
        variant: "success",
      });
      setOpenDeleteAcademicDetailsDialog(false);
      setEditAcademicDetails(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Detail Delete Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  console.log("Transformed Profile Data: ", transformProfileData);
  return (
    <Stack>
      <Stack
        sx={{
          display: "flex",
          flexDirection: isTablet ? "column" : "row",
          px: "1rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          my: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            p: "3rem",
            height: "fit-content",
          }}
          gap={2}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: statusColor,
                color: statusColor,
                boxShadow: "0 0 0 2px white",
                height: "16px",
                width: "16px",
                borderRadius: "50%",
              },
            }}
          >
            <ProfileImage
              name={selectedUser?.name}
              files={imageFile ? [imageFile] : selectedUser?.profileImage}
              fontSize="5rem"
            />
          </Badge>
          <Typography
            variant="h4"
            textAlign={"center"}
            sx={{
              fontSize: "1.5rem",
              color: "var(--pallet-dark-blue)",
            }}
          >
            {selectedUser?.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: isTablet ? "column" : "row",
            }}
            gap={2}
          >
            <CustomButton variant="outlined" component="label" sx={{ mt: 2 }}>
              Change Profile Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </CustomButton>

            {imageFile && (
              <CustomButton
                variant="contained"
                onClick={saveImage}
                sx={{ mt: 2, backgroundColor: "var(--pallet-blue)" }}
                disabled={isPending}
                endIcon={
                  isPending && (
                    <CircularProgress size={20} sx={{ color: "gray" }} />
                  )
                }
              >
                Save
              </CustomButton>
            )}
          </Box>
        </Box>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            flex: 2,
            p: "3rem",
            justifyContent: "center",
          }}
        >
          {isMobile && (
            <Stack
              mb={4}
              sx={{
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <Box>
                <>
                  {isTablet ? (
                    <IconButton
                      aria-label="edit"
                      onClick={() => setOpenEditUserRoleDialog(true)}
                    >
                      <EditOutlinedIcon sx={{ color: "var(--pallet-blue)" }} />
                    </IconButton>
                  ) : (
                    <CustomButton
                      variant="contained"
                      sx={{ backgroundColor: "var(--pallet-blue)" }}
                      size="medium"
                      onClick={() => setOpenEditUserRoleDialog(true)}
                      startIcon={<EditOutlinedIcon />}
                    >
                      Edit My Profile
                    </CustomButton>
                  )}
                </>
              </Box>
            </Stack>
          )}
          <Stack direction={isTablet ? "column" : "row"}>
            <DrawerContentItem
              label={
                selectedUser?.employeeType === EmployeeType.TEACHER
                  ? "Staff ID"
                  : selectedUser?.employeeType === EmployeeType.STUDENT
                  ? "Student ID"
                  : "User ID"
              }
              value={selectedUser?.employeeNumber}
              sx={{ flex: 1 }}
            />
            <DrawerContentItem
              label="Email"
              value={selectedUser?.email}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction={isTablet ? "column" : "row"}>
            <DrawerContentItem
              label="Full Name"
              value={selectedUser?.name}
              sx={{ flex: 1 }}
            />
            <DrawerContentItem
              label="Mobile Number"
              value={selectedUser?.mobile}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction={isTablet ? "column" : "row"}>
            <DrawerContentItem
              label="Birth Date"
              value={
                selectedUser?.birthDate
                  ? format(new Date(selectedUser?.birthDate), "yyyy-MM-dd")
                  : "--"
              }
              sx={{ flex: 1 }}
            />
            <DrawerContentItem
              label="Gender"
              value={selectedUser?.gender}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction={isTablet ? "column" : "row"}>
            <DrawerContentItem
              label="Address"
              value={selectedUser?.address}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Stack>
        {!isMobile && (
          <Stack
            mb={4}
            mt={4}
            sx={{
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <Box>
              <>
                {isTablet ? (
                  <IconButton
                    aria-label="edit"
                    onClick={() => setOpenEditUserRoleDialog(true)}
                  >
                    <EditOutlinedIcon sx={{ color: "var(--pallet-blue)" }} />
                  </IconButton>
                ) : (
                  <CustomButton
                    variant="contained"
                    sx={{ backgroundColor: "var(--pallet-blue)" }}
                    size="medium"
                    onClick={() => setOpenEditUserRoleDialog(true)}
                    startIcon={<EditOutlinedIcon />}
                  >
                    Edit My Profile
                  </CustomButton>
                )}
              </>
            </Box>
          </Stack>
        )}
        {openEditUserRoleDialog && (
          <UpdateUserProfile
            open={openEditUserRoleDialog}
            handleClose={() => {
              setOpenViewProfileDrawer(true);
              setOpenEditUserRoleDialog(false);
            }}
            defaultValues={user}
          />
        )}
        {openEditUserPasswordResetDialog && (
          <PasswordResetDialog
            open={openEditUserPasswordResetDialog}
            handleClose={() => {
              setOpenEditUserPasswordResetDialog(false);
              setOpenEditUserRoleDialog(false);
            }}
            onSubmit={(data) => {}}
            defaultValues={user}
          />
        )}
        {openEditUserEmailResetDialog && (
          <ResetEmailDialog
            open={openEditUserEmailResetDialog}
            handleClose={() => {
              setOpenEditUserEmailResetDialog(false);
              setOpenEditUserRoleDialog(false);
            }}
            defaultValues={user}
          />
        )}

        {openAcademicDetailsDialog && (
          <AddOrEditAcademicDetailsDialog
            open={openAcademicDetailsDialog}
            setOpen={setOpenAcademicDetailsDialog}
            defaultValues={editAcademicDetails}
          />
        )}
      </Stack>
      <Stack
        sx={{
          my: 1,
        }}
      >
        {selectedUser.employeeType === EmployeeType.TEACHER && (
          <Accordion
            variant="elevation"
            sx={{
              paddingTop: 0,
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              style={{
                borderBottom: `1px solid${colors.grey[100]}`,
                borderRadius: "8px",
              }}
              id="panel1a-header"
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "10px 0",
                }}
              >
                <Typography
                  color="textSecondary"
                  variant="body2"
                  sx={{
                    color: "black",
                    fontWeight: "semi-bold",
                  }}
                >
                  ACADEMIC DETAILS
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: "1rem",
                  marginBottom: theme.spacing(2),
                }}
              >
                <CustomButton
                  variant="contained"
                  sx={{
                    backgroundColor: "var(--pallet-blue)",
                  }}
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditAcademicDetails(null);
                    setOpenAcademicDetailsDialog(true);
                  }}
                >
                  Add Academic Details
                </CustomButton>
              </Box>
              {transformProfileData.map(({ year, profiles }) => (
                <Accordion
                  key={year}
                  variant="elevation"
                  sx={{ borderRadius: "8px", mt: "1rem" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      borderBottom: `1px solid ${colors.grey[100]}`,
                      borderRadius: "8px",
                    }}
                  >
                    <Typography sx={{ color: "var(--pallet-blue)" }}>
                      Year {year}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <TableContainer
                      component={Paper}
                      elevation={2}
                      sx={{
                        overflowX: "auto",
                        maxWidth: isMobile ? "88vw" : "100%",
                      }}
                    >
                      {isAcademicDetailDeleting && (
                        <LinearProgress sx={{ width: "100%" }} />
                      )}
                      <Table aria-label="simple table">
                        <TableHead
                          sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                        >
                          <TableRow>
                            <TableCell>Grade</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Medium</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {profiles.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{`Grade ` + p.grade?.grade}</TableCell>
                              <TableCell>{p.subject?.subjectName}</TableCell>
                              <TableCell>{p.class?.className}</TableCell>
                              <TableCell>{p.academicMedium}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => {
                                    setEditAcademicDetails(p);
                                    setOpenAcademicDetailsDialog(true);
                                  }}
                                  disabled={isAcademicDetailDeleting}
                                >
                                  <EditIcon color="primary" />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setEditAcademicDetails(p);
                                    setOpenDeleteAcademicDetailsDialog(true);
                                  }}
                                  disabled={isAcademicDetailDeleting}
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        <Stack
          sx={{
            mt: "1rem",
          }}
        >
          <Accordion
            variant="elevation"
            sx={{
              paddingTop: 0,
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              style={{
                borderBottom: `1px solid${colors.grey[100]}`,
                borderRadius: "8px",
              }}
              id="panel1a-header"
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "10px 0",
                }}
              >
                <Typography
                  color="textSecondary"
                  variant="body2"
                  sx={{
                    color: "var(--pallet-red)",
                  }}
                >
                  DANGER ZONE
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails style={{ paddingTop: 0 }}>
              <DrawerUpdateButtons
                onResetEmail={() => {
                  setOpenEditUserEmailResetDialog(true);
                }}
                onResetPassword={() => {
                  setOpenEditUserPasswordResetDialog(true);
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>
      {openDeleteAcademicDetailsDialog && (
        <DeleteConfirmationModal
          open={openDeleteAcademicDetailsDialog}
          title="Remove Academic Details Confirmation"
          content={
            <>
              Are you sure you want to remove this Academic Details?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteAcademicDetailsDialog(false)}
          deleteFunc={async () => {
            deleteAcademicDetailMutation(editAcademicDetails.id);
          }}
          onSuccess={() => {
            setOpenDeleteAcademicDetailsDialog(false);
            setEditAcademicDetails(null);
          }}
          handleReject={() => {
            setOpenDeleteAcademicDetailsDialog(false);
            setEditAcademicDetails(null);
          }}
        />
      )}
    </Stack>
  );
}

export default ViewUserContent;
