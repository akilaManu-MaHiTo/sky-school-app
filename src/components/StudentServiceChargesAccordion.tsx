import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetchStudentServiceChargesByStudent } from "../api/studentServiceChargesApi";

type StudentServiceChargesAccordionProps = {
  studentId: number | string;
};

const StudentServiceChargesAccordion = ({
  studentId,
}: StudentServiceChargesAccordionProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-service-charges-by-student", studentId],
    queryFn: () => fetchStudentServiceChargesByStudent(Number(studentId)),
    enabled: Boolean(studentId),
  });

  const charges = Array.isArray(data)
    ? data
    : Array.isArray(data?.charges)
      ? data.charges
      : [];
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );
  return (
    <Accordion variant="elevation" sx={{ borderRadius: "8px", mt: "1rem" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          borderBottom: "1px solid var(--pallet-lighter-grey)",
          borderRadius: "8px",
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
          SERVICE CHARGES
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {isError && (
          <Typography color="error" variant="body2">
            Unable to load service charges.
          </Typography>
        )}
        {!isLoading && !isError && charges.length === 0 && (
          <Typography variant="body2" color="textSecondary">
            No service charges available.
          </Typography>
        )}
        {!isLoading && !isError && charges.length > 0 && (
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              overflowX: "auto",
              maxWidth: isMobile ? "80vw" : "100%",
            }}
          >
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date Charged</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charges.map((charge: any) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      {charge.category?.categoryName ??
                        charge.chargesCategory?.categoryName ??
                        charge.chargesCategoryId?.categoryName ??
                        "--"}
                    </TableCell>
                    <TableCell>{charge.yearForCharge ?? "--"}</TableCell>
                    <TableCell align="right">{charge.amount ?? "--"}</TableCell>
                    <TableCell>
                      {charge.dateCharged &&
                      !Number.isNaN(new Date(charge.dateCharged).getTime())
                        ? format(new Date(charge.dateCharged), "yyyy-MM-dd")
                        : "--"}
                    </TableCell>
                    <TableCell>{charge.remarks ?? "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default StudentServiceChargesAccordion;
