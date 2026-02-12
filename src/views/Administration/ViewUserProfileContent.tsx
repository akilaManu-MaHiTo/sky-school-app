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
import {
  EmployeeType,
  fetchOldStudentUniversityData,
  fetchOldStudentOccupationData,
  updateUserProfileImage,
  User,
} from "../../api/userApi";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import AddOrEditTeacherAcademicDetailsDialog from "./AcademicDetails/AddOrEditTeacherAcademicDetailsDialog";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { deleteAcademicDetail } from "../../api/OrganizationSettings/academicDetailsApi";
import { deleteParentProfile } from "../../api/parentApi";
import { format } from "date-fns";
import AddOrEditStudentAcademicDetailsDialog from "./AcademicDetails/AddOrEditStudentAcademicDetailsDialog";
import { getPlainAddress } from "../../util/plainText.util";
import AddOrEditChildrenDetailsDialog from "./AcademicDetails/AddOrEditChildrenDetailsDialog";
import TeacherDetailsAccordion from "./TeacherDetailsAccordion";
import AddOrEditOldStudentsUniversityDialog from "./OldStudentsDetails/AddOrEditOldStudentsUniversityDialog";
import AddOrEditOldStudentOccupationDialog from "./OldStudentsDetails/AddOrEditOldStudentOccupationDialog";
import {
  deleteOldStudentUniversity,
  deleteOldStudentOccupation,
} from "../../api/oldStudentsApi";

type BasketSubject = {
  id: number;
  subjectCode: string;
  subjectName: string;
  subjectMedium: string;
  basketGroup: string;
  isBasketSubject: boolean;
};

type StudentProfileEntry = {
  id: number | string;
  academicYear?: string;
  academicMedium?: string;
  grade?: { id?: number | string; grade?: string } | null;
  class?: { id?: number | string; className?: string } | null;
  basketSubjectsIds?: Array<number | string>;
  basketSubjects?: Record<string, BasketSubject> | null;
  isStudentApproved?: number | boolean;
};

type ParentAcademicProfile = StudentProfileEntry & {
  createdAt?: string;
  updatedAt?: string;
};

type ParentChildProfile = {
  parentProfileId: number | string;
  id: number | string;
  name?: string | null;
  nameWithInitials?: string | null;
  email?: string | null;
  mobile?: string | null;
  gender?: string | null;
  employeeId?: string | null;
  academicProfiles?: ParentAcademicProfile[];
};

type OldStudentUniversityEntry = {
  id: number;
  studentId: number;
  universityName: string;
  country: string;
  city: string;
  degree: string;
  faculty: string;
  yearOfAdmission: string;
  yearOfGraduation: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type OldStudentOccupationEntry = {
  id: number;
  studentId: number;
  companyName: string;
  occupation: string;
  description?: string | null;
  dateOfRegistration: string;
  country: string;
  city: string;
  created_at?: string | null;
  updated_at?: string | null;
};

const extractStudentSubjectGroups = (profiles: StudentProfileEntry[]) => {
  const groups = new Set<string>();
  profiles.forEach((profile) => {
    const subjectGroups = profile.basketSubjects ?? {};
    Object.keys(subjectGroups).forEach((groupName) => {
      if (groupName) {
        groups.add(groupName);
      }
    });
  });
  return Array.from(groups);
};

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
      setImageFile(null);
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

  const [openChildEditDialog, setOpenChildEditDialog] = useState(false);
  const [editChildDetails, setEditChildDetails] = useState(null);
  const [openDeleteChildDialog, setOpenDeleteChildDialog] = useState(false);

  const [
    openOldStudentUniversityDialog,
    setOpenOldStudentUniversityDialog,
  ] = useState(false);
  const [
    editOldStudentUniversity,
    setEditOldStudentUniversity,
  ] = useState<OldStudentUniversityEntry | null>(null);
  const [
    openDeleteOldStudentUniversityDialog,
    setOpenDeleteOldStudentUniversityDialog,
  ] = useState(false);

  const [
    openOldStudentOccupationDialog,
    setOpenOldStudentOccupationDialog,
  ] = useState(false);
  const [
    editOldStudentOccupation,
    setEditOldStudentOccupation,
  ] = useState<OldStudentOccupationEntry | null>(null);
  const [
    openDeleteOldStudentOccupationDialog,
    setOpenDeleteOldStudentOccupationDialog,
  ] = useState(false);

  const [
    openAcademicStudentDetailsDialog,
    setOpenAcademicStudentDetailsDialog,
  ] = useState(false);
  const [editAcademicStudentDetails, setEditAcademicStudentDetails] =
    useState(null);
  const [
    openDeleteAcademicStudentDetailsDialog,
    setOpenDeleteAcademicStudentDetailsDialog,
  ] = useState(false);

  const {
    data: OldStudentUniversityData,
    isLoading: isLoadingOldStudentUniversity,
  } = useQuery<OldStudentUniversityEntry[]>({
    queryKey: ["old-student-university-data", selectedUser?.id],
    queryFn: () => fetchOldStudentUniversityData(selectedUser.id),
  });
  console.log("OldStudentUniversityData", OldStudentUniversityData);

  const {
    data: OldStudentOccupationData,
    isLoading: isLoadingOldStudentOccupation,
  } = useQuery<OldStudentOccupationEntry[]>({
    queryKey: ["old-student-occupation-data", selectedUser?.id],
    queryFn: () => fetchOldStudentOccupationData(selectedUser.id),
    enabled: selectedUser.employeeType === EmployeeType.OLDSTUDENT,
  });
  console.log("OldStudentOccupationData", OldStudentOccupationData);

  const transformParentProfileData = useMemo(() => {
    if (!selectedUser || !(selectedUser as any).parentProfile) return [];

    const parentProfiles = (selectedUser as any)
      .parentProfile as ParentChildProfile[];

    return parentProfiles.map((child) => {
      const profiles = (child.academicProfiles ?? []) as StudentProfileEntry[];

      const grouped = profiles.reduce<Record<string, StudentProfileEntry[]>>(
        (acc, profile) => {
          const year = profile.academicYear ?? "N/A";
          if (!acc[year]) acc[year] = [];
          acc[year].push(profile);
          return acc;
        },
        {},
      );

      const sortedEntries = Object.entries(grouped).sort((a, b) => {
        const yearA = Number(a[0]);
        const yearB = Number(b[0]);
        if (!Number.isNaN(yearA) && !Number.isNaN(yearB)) {
          return yearB - yearA;
        }
        return b[0].localeCompare(a[0]);
      });

      return {
        child,
        years: sortedEntries.map(([year, profilesForYear]) => ({
          year,
          profiles: profilesForYear,
        })),
      };
    });
  }, [selectedUser]);

  const transformProfileData = useMemo(() => {
    if (!selectedUser || !selectedUser.userProfile) return [];

    const grouped: Record<string, any> = selectedUser.userProfile.reduce(
      (acc, profile) => {
        const year = profile.academicYear;
        if (!acc[year]) acc[year] = [];
        acc[year].push(profile);
        return acc;
      },
      {} as Record<string, any>,
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

  const transformStudentProfileData = useMemo<
    { year: string; profiles: StudentProfileEntry[] }[]
  >(() => {
    if (!selectedUser || !selectedUser.studentProfile) return [];

    const typedProfiles = selectedUser.studentProfile as StudentProfileEntry[];

    const grouped = typedProfiles.reduce<Record<string, StudentProfileEntry[]>>(
      (acc, profile) => {
        const year = profile.academicYear ?? "N/A";
        if (!acc[year]) acc[year] = [];
        acc[year].push(profile);
        return acc;
      },
      {},
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

  const {
    mutate: deleteParentProfileMutation,
    isPending: isDeletingParentProfile,
  } = useMutation({
    mutationFn: deleteParentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      enqueueSnackbar("Child profile removed successfully!", {
        variant: "success",
      });
      setOpenDeleteChildDialog(false);
      setEditChildDetails(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Remove child profile failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const {
    mutate: deleteOldStudentUniversityMutation,
    isPending: isDeletingOldStudentUniversity,
  } = useMutation({
    mutationFn: (id: number | string) => deleteOldStudentUniversity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["old-student-university-data"],
      });
      enqueueSnackbar("University/college details removed successfully!", {
        variant: "success",
      });
      setOpenDeleteOldStudentUniversityDialog(false);
      setEditOldStudentUniversity(null);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || "Failed to remove university/college details";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const {
    mutate: deleteOldStudentOccupationMutation,
    isPending: isDeletingOldStudentOccupation,
  } = useMutation({
    mutationFn: (id: number | string) => deleteOldStudentOccupation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["old-student-occupation-data"],
      });
      enqueueSnackbar("Occupation details removed successfully!", {
        variant: "success",
      });
      setOpenDeleteOldStudentOccupationDialog(false);
      setEditOldStudentOccupation(null);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || "Failed to remove occupation details";
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
            <CustomButton
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
              endIcon={
                isPending && (
                  <CircularProgress size={20} sx={{ color: "gray" }} />
                )
              }
            >
              Change Profile Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </CustomButton>

            {imageFile && !isPending && (
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
              label="National ID Number"
              value={selectedUser?.nationalId}
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
              label="Name With Initials"
              value={selectedUser?.nameWithInitials}
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
              label="Email"
              value={selectedUser?.email}
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
              label="Date Of Register"
              value={
                selectedUser?.dateOfRegister
                  ? format(new Date(selectedUser?.dateOfRegister), "yyyy-MM-dd")
                  : "--"
              }
              sx={{ flex: 1 }}
            />
            <DrawerContentItem
              label="Address"
              value={getPlainAddress(selectedUser?.address)}
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
          <AddOrEditTeacherAcademicDetailsDialog
            open={openAcademicDetailsDialog}
            setOpen={setOpenAcademicDetailsDialog}
            defaultValues={editAcademicDetails}
          />
        )}

        {openAcademicStudentDetailsDialog && (
          <AddOrEditStudentAcademicDetailsDialog
            open={openAcademicStudentDetailsDialog}
            setOpen={setOpenAcademicStudentDetailsDialog}
            defaultValues={editAcademicStudentDetails}
          />
        )}
      </Stack>
      <Stack
        sx={{
          my: 1,
        }}
      >
        {selectedUser.employeeType === EmployeeType.TEACHER && (
          <TeacherDetailsAccordion teacherId={selectedUser.id} />
        )}
        {(selectedUser.employeeType === EmployeeType.STUDENT ||
          selectedUser.employeeType === EmployeeType.OLDSTUDENT) && (
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
                  MY ACADEMIC DETAILS
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
                    setEditAcademicStudentDetails(null);
                    setOpenAcademicStudentDetailsDialog(true);
                  }}
                >
                  Add Academic Details
                </CustomButton>
              </Box>
              {transformStudentProfileData.map(({ year, profiles }) => {
                const subjectGroups = extractStudentSubjectGroups(profiles);
                return (
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
                        <Table aria-label="student profile table">
                          <TableHead
                            sx={{
                              backgroundColor: "var(--pallet-lighter-blue)",
                            }}
                          >
                            <TableRow>
                              <TableCell>Grade</TableCell>
                              <TableCell>Class</TableCell>
                              <TableCell>Medium</TableCell>
                              {subjectGroups.map((group) => (
                                <TableCell key={group}>{group}</TableCell>
                              ))}
                              <TableCell align="right"></TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {profiles.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell>
                                  {`Grade ` + (p.grade?.grade ?? "-")}
                                </TableCell>
                                <TableCell>
                                  {p.class?.className ?? "--"}
                                </TableCell>
                                <TableCell>
                                  {p.academicMedium ?? "--"}
                                </TableCell>
                                {subjectGroups.map((group) => {
                                  const subject = p.basketSubjects?.[group];
                                  return (
                                    <TableCell key={`${p.id}-${group}`}>
                                      {subject ? (
                                        <Typography>
                                          {subject.subjectName}
                                        </Typography>
                                      ) : (
                                        "--"
                                      )}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="right">
                                  {!p.isStudentApproved && (
                                    <>
                                      <IconButton
                                        onClick={() => {
                                          setEditAcademicStudentDetails(p);
                                          setOpenAcademicStudentDetailsDialog(
                                            true,
                                          );
                                        }}
                                        disabled={isAcademicDetailDeleting}
                                      >
                                        <EditIcon color="primary" />
                                      </IconButton>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </AccordionDetails>
          </Accordion>
        )}
        {selectedUser.employeeType === EmployeeType.OLDSTUDENT && (
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
                  OLD STUDENT UNIVERSITY/COLLEGE DETAILS
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
                    setEditOldStudentUniversity(null);
                    setOpenOldStudentUniversityDialog(true);
                  }}
                >
                  Add University/College Details
                </CustomButton>
              </Box>
              {isLoadingOldStudentUniversity && (
                <LinearProgress sx={{ width: "100%", mb: 2 }} />
              )}
              {Array.isArray(OldStudentUniversityData) &&
              OldStudentUniversityData.length > 0
                ? OldStudentUniversityData.map((uni) => (
                    <Accordion
                      key={uni.id}
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ color: "var(--pallet-blue)" }}>
                            {uni.universityName}{" "}
                            {uni.degree && `- ${uni.faculty}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {uni.city}, {uni.country}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mb: 1,
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                setEditOldStudentUniversity(uni);
                                setOpenOldStudentUniversityDialog(true);
                              }}
                            >
                              <EditIcon color="primary" />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setEditOldStudentUniversity(uni);
                                setOpenDeleteOldStudentUniversityDialog(true);
                              }}
                              disabled={isDeletingOldStudentUniversity}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Box>
                          <Stack flexDirection={isMobile ? "column" : "row"}>
                            <DrawerContentItem
                              label="Degree"
                              value={uni.degree}
                              sx={{ flex: 1 }}
                            />
                            <DrawerContentItem
                              label="Faculty"
                              value={uni.faculty}
                              sx={{ flex: 1 }}
                            />
                          </Stack>

                          <Stack flexDirection={isMobile ? "column" : "row"}>
                            <DrawerContentItem
                              label="Year of Admission"
                              value={uni.yearOfAdmission}
                              sx={{ flex: 1 }}
                            />
                            <DrawerContentItem
                              label="Year of Graduation"
                              value={uni.yearOfGraduation}
                              sx={{ flex: 1 }}
                            />
                          </Stack>

                          <DrawerContentItem
                            label="Location"
                            value={uni.city + ", " + uni.country}
                            sx={{ flex: 1 }}
                          />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))
                : !isLoadingOldStudentUniversity && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      No university/college details available.
                    </Typography>
                  )}
            </AccordionDetails>
          </Accordion>
        )}

        {selectedUser.employeeType === EmployeeType.OLDSTUDENT && (
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
                  OLD STUDENT OCCUPATION DETAILS
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
                    setEditOldStudentOccupation(null);
                    setOpenOldStudentOccupationDialog(true);
                  }}
                >
                  Add Occupation Details
                </CustomButton>
              </Box>
              {isLoadingOldStudentOccupation && (
                <LinearProgress sx={{ width: "100%", mb: 2 }} />
              )}
              {Array.isArray(OldStudentOccupationData) &&
              OldStudentOccupationData.length > 0
                ? OldStudentOccupationData.map((occ) => (
                    <Accordion
                      key={occ.id}
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ color: "var(--pallet-blue)" }}>
                            {occ.companyName}
                            {occ.occupation && ` - ${occ.occupation}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {occ.city}, {occ.country}
                          </Typography>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              mb: 1,
                              gap: 1,
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                setEditOldStudentOccupation(occ);
                                setOpenOldStudentOccupationDialog(true);
                              }}
                            >
                              <EditIcon color="primary" />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setEditOldStudentOccupation(occ);
                                setOpenDeleteOldStudentOccupationDialog(true);
                              }}
                              disabled={isDeletingOldStudentOccupation}
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Box>
                          <Stack flexDirection={isMobile ? "column" : "row"}>
                            <DrawerContentItem
                              label="Company Name"
                              value={occ.companyName}
                              sx={{ flex: 1 }}
                            />
                            <DrawerContentItem
                              label="Occupation"
                              value={occ.occupation}
                              sx={{ flex: 1 }}
                            />
                          </Stack>

                          <Stack flexDirection={isMobile ? "column" : "row"}>
                            <DrawerContentItem
                              label="Date Of Registration"
                              value={occ.dateOfRegistration}
                              sx={{ flex: 1 }}
                            />
                            <DrawerContentItem
                              label="Location"
                              value={occ.city + ", " + occ.country}
                              sx={{ flex: 1 }}
                            />
                          </Stack>

                          <DrawerContentItem
                            label="Description"
                            value={occ.description || "--"}
                            sx={{ flex: 1 }}
                          />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))
                : !isLoadingOldStudentOccupation && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      No occupation details available.
                    </Typography>
                  )}
            </AccordionDetails>
          </Accordion>
        )}

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

        {selectedUser.employeeType === EmployeeType.PARENT && (
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
                  MY CHILDREN
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
                    setEditChildDetails(null);
                    setOpenChildEditDialog(true);
                  }}
                >
                  Add My Child
                </CustomButton>
              </Box>
              {transformParentProfileData.map(({ child, years }) => (
                <Accordion
                  key={child.id}
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: isMobile
                          ? "flex-start"
                          : "space-between",
                        width: isMobile ? "100%" : "30%",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: 0,
                        }}
                      >
                        <Typography sx={{ color: "var(--pallet-blue)" }} noWrap>
                          {child.nameWithInitials
                            ? `${child.nameWithInitials}${child.employeeId ? ` | ${child.employeeId}` : ""}`
                            : `Child ${child.id}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          noWrap
                        >
                          {child.gender ? `${child.gender}` : ""}
                          {child.mobile
                            ? child.gender
                              ? ` | ${child.mobile}`
                              : `${child.mobile}`
                            : ""}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete-child"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditChildDetails(child);
                          setOpenDeleteChildDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    {years.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        No academic details available.
                      </Typography>
                    )}
                    {years.map(({ year, profiles }) => {
                      const subjectGroups =
                        extractStudentSubjectGroups(profiles);
                      return (
                        <Accordion
                          key={`${child.id}-${year}`}
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
                              <Table aria-label="child academic table">
                                <TableHead
                                  sx={{
                                    backgroundColor:
                                      "var(--pallet-lighter-blue)",
                                  }}
                                >
                                  <TableRow>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Medium</TableCell>
                                    {subjectGroups.map((group) => (
                                      <TableCell key={group}>{group}</TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {profiles.map((p) => (
                                    <TableRow key={p.id}>
                                      <TableCell>
                                        {`Grade ` + (p.grade?.grade ?? "-")}
                                      </TableCell>
                                      <TableCell>
                                        {p.class?.className ?? "--"}
                                      </TableCell>
                                      <TableCell>
                                        {p.academicMedium ?? "--"}
                                      </TableCell>
                                      {subjectGroups.map((group) => {
                                        const subject =
                                          p.basketSubjects?.[group];
                                        return (
                                          <TableCell key={`${p.id}-${group}`}>
                                            {subject ? (
                                              <Typography>
                                                {subject.subjectName}
                                              </Typography>
                                            ) : (
                                              "--"
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
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
                  SECURITY SETTINGS
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
      {openDeleteChildDialog && (
        <DeleteConfirmationModal
          open={openDeleteChildDialog}
          title="Remove Child Confirmation"
          content={
            <>
              Are you sure you want to remove this child profile?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteChildDialog(false)}
          deleteFunc={async () => {
            // use parentProfileId to delete
            const id =
              (editChildDetails as any)?.parentProfileId ??
              (editChildDetails as any)?.id;
            deleteParentProfileMutation(id);
          }}
          onSuccess={() => {
            setOpenDeleteChildDialog(false);
            setEditChildDetails(null);
          }}
          handleReject={() => {
            setOpenDeleteChildDialog(false);
            setEditChildDetails(null);
          }}
        />
      )}
      {openChildEditDialog && (
        <AddOrEditChildrenDetailsDialog
          open={openChildEditDialog}
          setOpen={setOpenChildEditDialog}
          defaultValues={editChildDetails}
        />
      )}
      {openDeleteOldStudentUniversityDialog && editOldStudentUniversity && (
        <DeleteConfirmationModal
          open={openDeleteOldStudentUniversityDialog}
          title="Remove University/College Details Confirmation"
          content={
            <>
              Are you sure you want to remove this university/college
              details?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => {
            setOpenDeleteOldStudentUniversityDialog(false);
            setEditOldStudentUniversity(null);
          }}
          deleteFunc={async () => {
            deleteOldStudentUniversityMutation(editOldStudentUniversity.id);
          }}
          onSuccess={() => {
            setOpenDeleteOldStudentUniversityDialog(false);
            setEditOldStudentUniversity(null);
          }}
          handleReject={() => {
            setOpenDeleteOldStudentUniversityDialog(false);
            setEditOldStudentUniversity(null);
          }}
        />
      )}
      {openOldStudentUniversityDialog && (
        <AddOrEditOldStudentsUniversityDialog
          open={openOldStudentUniversityDialog}
          setOpen={setOpenOldStudentUniversityDialog}
          studentId={selectedUser.id}
          defaultValues={editOldStudentUniversity}
        />
      )}
      {openDeleteOldStudentOccupationDialog && editOldStudentOccupation && (
        <DeleteConfirmationModal
          open={openDeleteOldStudentOccupationDialog}
          title="Remove Occupation Details Confirmation"
          content={
            <>
              Are you sure you want to remove this occupation details?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => {
            setOpenDeleteOldStudentOccupationDialog(false);
            setEditOldStudentOccupation(null);
          }}
          deleteFunc={async () => {
            deleteOldStudentOccupationMutation(editOldStudentOccupation.id);
          }}
          onSuccess={() => {
            setOpenDeleteOldStudentOccupationDialog(false);
            setEditOldStudentOccupation(null);
          }}
          handleReject={() => {
            setOpenDeleteOldStudentOccupationDialog(false);
            setEditOldStudentOccupation(null);
          }}
        />
      )}
      {openOldStudentOccupationDialog && (
        <AddOrEditOldStudentOccupationDialog
          open={openOldStudentOccupationDialog}
          setOpen={setOpenOldStudentOccupationDialog}
          studentId={selectedUser.id}
          defaultValues={editOldStudentOccupation}
        />
      )}
    </Stack>
  );
}

export default ViewUserContent;
