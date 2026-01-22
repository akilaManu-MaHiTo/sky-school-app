import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { colors } from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomButton from "../../components/CustomButton";
import theme from "../../theme";
import {
  TeacherDetails,
  fetchTeacherDetails,
} from "../../api/teacherDetailsApi";
import AddOrEditTeacherDetailsDialog from "./AddOrEditTeacherDetailsDialog";
import { DrawerContentItem } from "../../components/ViewDataDrawer";
import useIsMobile from "../../customHooks/useIsMobile";
import { format } from "date-fns";

interface TeacherDetailsAccordionProps {
  teacherId: number;
}

const TeacherDetailsAccordion = ({
  teacherId,
}: TeacherDetailsAccordionProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { isTablet } = useIsMobile();

  const { data, isLoading, isError } = useQuery<TeacherDetails | null>({
    queryKey: ["teacher-details", teacherId],
    queryFn: async () => {
      const res = await fetchTeacherDetails(teacherId.toString());
      return res ?? null;
    },
    retry: false,
  });

  const hasData = !!data;

  return (
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
        aria-controls="teacher-details-content"
        id="teacher-details-header"
        sx={{
          borderBottom: `1px solid${colors.grey[100]}`,
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
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
            TEACHER DETAILS
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
            startIcon={hasData ? <EditIcon /> : <AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            {hasData ? "Edit Teacher Details" : "Add Teacher Details"}
          </CustomButton>
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && isError && !hasData && (
          <Typography variant="body2" color="textSecondary">
            No teacher details available.
          </Typography>
        )}

        {!isLoading && hasData && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Stack direction={isTablet ? "column" : "row"}>
              <DrawerContentItem
                label="Civil Status"
                value={data?.civilStatus ?? "--"}
                sx={{ flex: 1 }}
              />
              <DrawerContentItem
                label="Teacher Grade"
                value={data?.teacherGrade ?? "--"}
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction={isTablet ? "column" : "row"}>
              <DrawerContentItem
                label="Salary Type"
                value={data?.salaryType ?? "--"}
                sx={{ flex: 1 }}
              />
              <DrawerContentItem
                label="Teacher Transfer"
                value={data?.teacherTransfer ?? "--"}
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction={isTablet ? "column" : "row"}>
              <DrawerContentItem
                label="Date Of First Registration"
                value={
                  data?.dateOfFirstRegistration
                    ? format(
                        new Date(data?.dateOfFirstRegistration),
                        "yyyy-MM-dd",
                      )
                    : "--"
                }
                sx={{ flex: 1 }}
              />
              <DrawerContentItem
                label="Date Of Grade"
                value={
                  data?.dateOfGrade
                    ? format(
                        new Date(data?.dateOfGrade),
                        "yyyy-MM-dd",
                      )
                    : "--"
                }
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction={isTablet ? "column" : "row"}>
              <DrawerContentItem
                label="Date Of Retirement"
                value={
                  data?.dateOfRetirement
                    ? format(
                        new Date(data?.dateOfRetirement),
                        "yyyy-MM-dd",
                      )
                    : "--"
                }
                sx={{ flex: 1 }}
              />
              <DrawerContentItem
                label="Register Subject"
                value={
                  data?.registerPostDate
                    ? format(
                        new Date(data?.registerPostDate),
                        "yyyy-MM-dd",
                      )
                    : "--"
                }
                sx={{ flex: 1 }}
              />
            </Stack>

            <Stack direction={isTablet ? "column" : "row"}>
              <DrawerContentItem
                label="Register Post Number"
                value={data?.registerPostNumber ?? "--"}
                sx={{ flex: 1 }}
              />
              <DrawerContentItem
                label="Register Post Date"
                value={
                  data?.registerPostDate
                    ? format(
                        new Date(data?.registerPostDate),
                        "yyyy-MM-dd",
                      )
                    : "--"
                }
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>
        )}

        <AddOrEditTeacherDetailsDialog
          open={openDialog}
          setOpen={setOpenDialog}
          teacherId={teacherId}
          defaultValues={data ?? null}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default TeacherDetailsAccordion;
