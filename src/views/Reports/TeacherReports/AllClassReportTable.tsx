import React, { useMemo } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ClassReportTable from "./ClassReportTable";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useCurrentOrganization from "../../../hooks/useCurrentOrganization";
import { drawPdfHeader } from "../../../reportsUtils/OrganizationHeaderPDF";
import { drawPdfFooter } from "../../../reportsUtils/OrganizationFooter";

interface AllClassReportTableProps {
  /**
   * Expected shape:
   * {
   *   success: boolean;
   *   data: {
   *     term1?: TermReport;
   *     term2?: TermReport;
   *     term3?: TermReport;
   *   }
   * }
   */
  reportData?: any;
  isLoading: boolean;
  isMobile: boolean;
  isTablet?: boolean;
  showGroupColumns?: boolean;
}

function AllClassReportTable({
  reportData,
  isLoading,
  isMobile,
  isTablet,
  showGroupColumns = true,
}: AllClassReportTableProps) {
  const { organization } = useCurrentOrganization();
  const organizationName = organization?.organizationName;

  const termReports = useMemo(() => {
    if (!reportData || !reportData.data) return [] as any[];

    const { term1, term2, term3 } = reportData.data;

    const result: Array<{ key: string; termData: any }> = [];

    if (term1) result.push({ key: "term1", termData: term1 });
    if (term2) result.push({ key: "term2", termData: term2 });
    if (term3) result.push({ key: "term3", termData: term3 });

    return result;
  }, [reportData]);

  const handleExportAllTermsExcel = () => {
    if (!termReports.length) return;

    const workbook = XLSX.utils.book_new();

    termReports.forEach(({ key, termData }) => {
      if (!termData) return;

      const allSubjects = termData.subjects ?? [];
      const subjects = allSubjects; // include both basket and non-basket subjects

      const header = [
        "Admission Number",
        "Student",
        "Average",
        "Position",
        ...subjects.map((s: any) => s.subjectName),
      ];

      const body = (termData.MarkData ?? []).map((student: any) => {
        const marksRecord = (student.marks?.[0] ?? {}) as any;

        const normalize = (value: any) => {
          if (value === null || value === undefined || value === "") {
            return "-";
          }
          return value;
        };

        const base = [
          normalize(student.admissionNumber),
          normalize(student.nameWithInitials ?? student.userName),
          normalize(
            typeof student.averageOfMarks === "number"
              ? student.averageOfMarks.toFixed(2)
              : student.averageOfMarks
          ),
          normalize(student.position),
        ];

        const subjectValues = subjects.map((subject: any) => {
          const key = subject.subjectName;
          const subjectEntry = marksRecord[key];
          const value =
            subjectEntry && typeof subjectEntry.marks === "number"
              ? subjectEntry.marks
              : subjectEntry?.marks ?? null;
          return normalize(value);
        });

        return [...base, ...subjectValues];
      });

      const columnCount = header.length;

      const padRow = (row: (string | number)[]): (string | number)[] => {
        if (row.length >= columnCount) {
          return row.slice(0, columnCount);
        }
        return [...row, ...Array(columnCount - row.length).fill("")];
      };

      const yearLabel = termData.academicYear ?? termData.year ?? undefined;
      const gradeLabel = termData.grade ? String(termData.grade) : undefined;
      const classLabel = termData.className
        ? String(termData.className)
        : undefined;
      const termLabel = termData.term ?? undefined;

      const metaRows: (string | number)[][] = [];

      if (organizationName) {
        metaRows.push([organizationName]);
      }

      const sheetTitleRaw = termData.term || key;
      const sectionTitle = termLabel
        ? `Class Overall Report - ${termLabel}`
        : String(sheetTitleRaw);
      if (sectionTitle) {
        metaRows.push([sectionTitle]);
      }

      const worksheetData: (string | number)[][] = [
        ...metaRows.map(padRow),
        ...(metaRows.length ? [Array(columnCount).fill("")] : []),
        header,
        ...body,
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const sheetTitle = String(sheetTitleRaw).slice(0, 31) || "Term";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
    });

    const firstTerm = termReports[0]?.termData;
    const baseName =
      firstTerm?.grade && firstTerm?.className
        ? `grade-${firstTerm.grade}-${firstTerm.className}-all-terms`
        : "class-all-terms-report";
    const timestamp = new Date().toISOString().split("T")[0];
    const safeBaseName = baseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const fileName = `${safeBaseName}-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleExportAllTermsPdf = () => {
    if (!termReports.length) return;

    const doc = new jsPDF("l", "mm", "a4");
    let isFirstSection = true;

    termReports.forEach(({ key, termData }, index) => {
      if (!termData) return;

      if (!isFirstSection) {
        doc.addPage();
      }

      const hasRequiredFields =
        termData?.grade && termData?.className && termData?.term;
      const sectionTitle = hasRequiredFields
        ? `Grade ${termData.grade} ${termData.className} Class Overall Report - ${termData.term}`
        : `Term ${index + 1}`;

      const gradeLabel = hasRequiredFields ? String(termData.grade) : undefined;
      const classLabel = hasRequiredFields
        ? String(termData.className)
        : undefined;
      const yearLabel = termData.academicYear ?? termData.year ?? undefined;
      const termLabel = termData.term ?? undefined;

      const allSubjects = termData.subjects ?? [];
      const subjects = allSubjects; // include both basket and non-basket subjects
      const normalize = (value: any): string => {
        if (value === null || value === undefined || value === "") {
          return "-";
        }
        return String(value);
      };

      const headRow: string[] = [
        "#",
        "Admission Number",
        "Student",
        "Average",
        "Position",
        ...subjects.map((s: any) => s.subjectName),
      ];

      const body = (termData.MarkData ?? []).map(
        (student: any, rowIndex: number) => {
          const marksRecord = (student.marks?.[0] ?? {}) as any;

          const base = [
            (rowIndex + 1).toString(),
            normalize(student.admissionNumber),
            normalize(student.nameWithInitials ?? student.userName),
            normalize(
              typeof student.averageOfMarks === "number"
                ? student.averageOfMarks.toFixed(2)
                : student.averageOfMarks
            ),
            normalize(student.position),
          ];

          const subjectValues = subjects.map((subject: any) => {
            const key = subject.subjectName;
            const subjectEntry = marksRecord[key];
            const value =
              subjectEntry && typeof subjectEntry.marks === "number"
                ? subjectEntry.marks
                : subjectEntry?.marks ?? null;
            return normalize(value);
          });

          return [...base, ...subjectValues];
        }
      );

      autoTable(doc, {
        startY: 60,
        head: [headRow],
        body,
        pageBreak: "auto",
        theme: "grid",
        styles: {
          fontSize: 7,
          textColor: [40, 40, 40],
          halign: "left",
          valign: "middle",
        },
        headStyles: {
          fillColor: [169, 227, 229],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        margin: { top: 60, bottom: 15, left: 10, right: 10 },
        didDrawPage: (dataArg) => {
          // Common header with organization name
          drawPdfHeader(doc, {
            title: sectionTitle,
            organizationName,
            gradeLabel,
            classLabel,
            yearLabel,
            termLabel,
          });

          // Common details block below header
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(6, 66, 115);
          doc.text(sectionTitle, 15, 50);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);

          const leftLines: string[] = [];
          const rightLines: string[] = [];

          leftLines.forEach((line, index) => {
            doc.text(line, 15, 56 + index * 5);
          });

          rightLines.forEach((line, index) => {
            doc.text(line, 140, 56 + index * 5);
          });

          // Draw footer with organization name and page number
          drawPdfFooter(doc, dataArg.pageNumber, organizationName);
        },
      });

      isFirstSection = false;
    });

    const firstTerm = termReports[0]?.termData;
    const baseName =
      firstTerm?.grade && firstTerm?.className
        ? `grade-${firstTerm.grade}-${firstTerm.className}-all-terms`
        : "class-all-terms-report";
    const timestamp = new Date().toISOString().split("T")[0];
    const safeBaseName = baseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const fileName = `${safeBaseName}-${timestamp}.pdf`;

    doc.save(fileName);
  };

  if (!termReports.length) {
    return (
      <Box>
        <Typography variant="body2" align="center">
          No term-wise class report data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Box display="flex" justifyContent="flex-end" mb={2} gap={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={handleExportAllTermsExcel}
          disabled={isLoading || !termReports.length}
        >
          Export Excel
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdfIcon fontSize="small" />}
          onClick={handleExportAllTermsPdf}
          disabled={isLoading || !termReports.length}
        >
          Export PDF
        </Button>
      </Box>
      {termReports.map(({ key, termData }, index) => {
        const hasRequiredFields =
          termData?.grade && termData?.className && termData?.term;
        const title = hasRequiredFields
          ? `Grade ${termData.grade} ${termData.className} Class Overall Report - ${termData.term}`
          : `Term ${index + 1}`;

        return (
          <Box key={key}>
            {index > 0 && <Divider sx={{ mb: 3 }} />}
            <ClassReportTable
              reportData={{ data: termData }}
              isLoading={isLoading}
              isMobile={isMobile}
              isTablet={isTablet}
              title={title}
              showGroupColumns={showGroupColumns}
            />
          </Box>
        );
      })}
    </Box>
  );
}

export default AllClassReportTable;
