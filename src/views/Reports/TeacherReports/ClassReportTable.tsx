import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { exportClassReportToExcel } from "../../../reportsUtils/ClassReportExcel";
import { generateClassReportPdf } from "../../../reportsUtils/ClassReportPDF";
import useCurrentOrganization from "../../../hooks/useCurrentOrganization";

interface ClassReportTableProps {
  reportData?: any;
  isLoading: boolean;
  isMobile: boolean;
  isTablet?: boolean;
  title: string;
  showGroupColumns?: boolean;
}

const GROUP_NAMES: string[] = ["Group 1", "Group 2", "Group 3"];

function ClassReportTable({
  reportData,
  isLoading,
  isMobile,
  title,
  isTablet,
  showGroupColumns = true,
}: ClassReportTableProps) {
  const [groupFilter, setGroupFilter] = useState<Record<string, string | null>>(
    {}
  );
  const [groupMenuAnchor, setGroupMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [activeGroupForMenu, setActiveGroupForMenu] = useState<string | null>(
    null
  );

  const { organization } = useCurrentOrganization();
  const organizationName = organization?.organizationName;

  const classReportTableData = useMemo(() => {
    if (!reportData || !reportData.data) {
      return {
        subjects: [] as any[],
        exportSubjects: [] as any[],
        groupNames: showGroupColumns ? GROUP_NAMES : [],
        rows: [] as any[],
        basketSubjectsByGroup: {} as Record<string, any[]>,
      };
    }

    const allSubjects = reportData.data.subjects ?? [];

    const subjects = allSubjects.filter(
      (subject: any) => !subject.isBasketSubject
    );

    const basketSubjectsByGroup: Record<string, any[]> = {
      "Group 1": [],
      "Group 2": [],
      "Group 3": [],
    };

    allSubjects
      .filter((subject: any) => subject.isBasketSubject && subject.group)
      .forEach((subject: any) => {
        const groupName = subject.group as string;
        if (basketSubjectsByGroup[groupName]) {
          basketSubjectsByGroup[groupName].push(subject);
        }
      });

    const rows = (reportData.data.MarkData ?? []).map((student: any) => {
      const marksRecord = (student.marks?.[0] ?? {}) as any;

      const subjectMarks: Record<string, number | null> = {};
      allSubjects.forEach((subject: any) => {
        const key = subject.subjectName;
        const subjectEntry = marksRecord[key];
        subjectMarks[key] =
          subjectEntry && typeof subjectEntry.marks === "number"
            ? subjectEntry.marks
            : subjectEntry?.marks ?? null;
      });

      const groupMarks: Record<string, number | null> = {};
      const groupSubjects: Record<string, string | null> = {};
      GROUP_NAMES.forEach((groupName: string) => {
        const groupEntry = marksRecord[groupName];
        groupMarks[groupName] =
          groupEntry && typeof groupEntry.marks === "number"
            ? groupEntry.marks
            : groupEntry?.marks ?? null;
        groupSubjects[groupName] = groupEntry?.subject ?? null;
      });

      return {
        id: student.userName,
        admissionNumber: student.admissionNumber,
        userName: student.userName,
        nameWithInitials: student.nameWithInitials,
        email: student.email,
        averageOfMarks: student.averageOfMarks,
        position: student.position,
        subjectMarks,
        groupMarks,
        groupSubjects,
      };
    });

    return {
      subjects,
      exportSubjects: allSubjects,
        groupNames: showGroupColumns ? GROUP_NAMES : [],
      rows,
      basketSubjectsByGroup,
    };
  }, [reportData, showGroupColumns]);

  const filteredRows = useMemo(() => {
    const rows = classReportTableData.rows ?? [];
    const hasAnyFilter = Object.values(groupFilter).some((v) => v);

    if (!hasAnyFilter) {
      return rows;
    }

    return rows.filter((row: any) => {
      return Object.entries(groupFilter).every(([groupName, subjectName]) => {
        if (!subjectName) return true;
        return row.groupSubjects?.[groupName] === subjectName;
      });
    });
  }, [classReportTableData.rows, groupFilter]);

  const handleExportExcel = () => {
    if (!filteredRows.length) return;

    const meta = reportData?.data ?? {};
    const gradeLabel = meta.grade ? String(meta.grade) : undefined;
    const classLabel = meta.className ? String(meta.className) : undefined;
    const yearLabel = meta.academicYear ?? meta.year ?? undefined;
    const termLabel = meta.term ?? undefined;

    exportClassReportToExcel({
      title,
      subjects: classReportTableData.exportSubjects,
      groupNames: showGroupColumns ? classReportTableData.groupNames : [],
      rows: filteredRows,
      options: {
        title,
        organizationName,
        gradeLabel,
        classLabel,
        yearLabel,
        termLabel,
      },
    } as any);
  };

  const handleExportPdf = () => {
    if (!filteredRows.length) return;

    try {
      const meta = reportData?.data ?? {};
      const gradeLabel = meta.grade ? String(meta.grade) : undefined;
      const classLabel = meta.className ? String(meta.className) : undefined;
      const yearLabel = meta.academicYear ?? meta.year ?? undefined;
      const termLabel = meta.term ?? undefined;

      generateClassReportPdf({
        headerData: {
          title,
          organizationName,
          gradeLabel,
          classLabel,
          yearLabel,
          termLabel,
        },
        subjects: classReportTableData.exportSubjects,
        groupNames: showGroupColumns ? classReportTableData.groupNames : [],
        rows: filteredRows,
      } as any);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to generate class report PDF", err);
    }
  };

  return (
    <Box>
      <Box
        mb={3}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "left",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportExcel}
            disabled={isLoading || !filteredRows.length}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon fontSize="small" />}
            onClick={handleExportPdf}
            disabled={isLoading || !filteredRows.length}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          overflowX: "auto",
          maxWidth: isMobile ? "75vw" : isTablet ? "88vW" : "100%",
        }}
      >
        {isLoading && <LinearProgress sx={{ width: "100%" }} />}
        <Table aria-label="class report table">
          <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
            <TableRow>
              <TableCell>Admission Number</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell align="right">Average</TableCell>
              <TableCell align="right">Rank</TableCell>
              {classReportTableData.subjects.map((subject: any) => (
                <TableCell key={subject.id} align="right">
                  {subject.subjectName}
                </TableCell>
              ))}
              {classReportTableData.groupNames.map((groupName: string) => (
                <TableCell
                  key={groupName}
                  align="left"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 0.25,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setGroupMenuAnchor(event.currentTarget);
                          setActiveGroupForMenu(groupName);
                        }}
                      >
                        <ArrowDropDownIcon
                          fontSize="small"
                          color={groupFilter[groupName] ? "primary" : "inherit"}
                        />
                      </IconButton>
                      <Typography variant="body2">{groupName}</Typography>
                    </Box>
                    {groupFilter[groupName] && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        align="left"
                      >
                        {groupFilter[groupName]}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row.admissionNumber ?? "--"}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.nameWithInitials}
                  </TableCell>
                  <TableCell align="right">
                    {typeof row.averageOfMarks === "number"
                      ? row.averageOfMarks.toFixed(2) + "%"
                      : row.averageOfMarks + "%"}
                  </TableCell>
                  <TableCell align="right">{row.position ?? "--"}</TableCell>
                  {classReportTableData.subjects.map((subject: any) => {
                    const value = row.subjectMarks[subject.subjectName] ?? null;
                    return (
                      <TableCell key={`${row.id}-${subject.id}`} align="right">
                        {value ?? "--"}
                      </TableCell>
                    );
                  })}
                  {classReportTableData.groupNames.map((groupName: string) => {
                    const value = row.groupMarks[groupName] ?? null;
                    return (
                      <TableCell key={`${row.id}-${groupName}`} align="right">
                        {value ?? "--"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    5 +
                    classReportTableData.subjects.length +
                    classReportTableData.groupNames.length
                  }
                  align="center"
                >
                  <Typography variant="body2">
                    No student marks available. Please adjust filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={groupMenuAnchor}
        open={Boolean(groupMenuAnchor && activeGroupForMenu)}
        onClose={() => {
          setGroupMenuAnchor(null);
          setActiveGroupForMenu(null);
        }}
      >
        {activeGroupForMenu && (
          <>
            {(
              classReportTableData.basketSubjectsByGroup?.[
                activeGroupForMenu
              ] ?? []
            ).map((subject: any) => (
              <MenuItem
                key={subject.id}
                dense
                selected={
                  groupFilter[activeGroupForMenu as string] ===
                  subject.subjectName
                }
                onClick={() => {
                  setGroupFilter((prev) => ({
                    ...prev,
                    [activeGroupForMenu]: subject.subjectName,
                  }));
                  setGroupMenuAnchor(null);
                  setActiveGroupForMenu(null);
                }}
              >
                {subject.subjectName}
              </MenuItem>
            ))}
            <MenuItem
              dense
              onClick={() => {
                if (!activeGroupForMenu) return;
                setGroupFilter((prev) => ({
                  ...prev,
                  [activeGroupForMenu]: null,
                }));
                setGroupMenuAnchor(null);
                setActiveGroupForMenu(null);
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "error.main", fontWeight: 400, fontSize: 11 }}
              >
                Clear filter
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default ClassReportTable;
