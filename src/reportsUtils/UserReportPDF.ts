import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { format } from "date-fns";
import { User } from "../api/userApi";
import { getPlainAddress } from "../util/plainText.util";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export type UserExportMode = "summary" | "profileRows";

export interface UserReportPdfOptions extends PdfHeaderData {
  title?: string;
  mode?: UserExportMode;
}

interface ExportPayload {
  users: User[];
  headerData?: UserReportPdfOptions;
}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

type ProfileLike = {
  academicYear?: string;
  academicMedium?: string;
  grade?: { grade?: string } | null;
  class?: { className?: string } | null;
  basketSubjects?: Record<string, { subjectName: string }> | null;
};

const getUserProfileSummary = (user: User) => {
  const rawProfiles: ProfileLike[] = [
    ...(((user as any).userProfile ?? []) as ProfileLike[]),
    ...(((user as any).studentProfile ?? []) as ProfileLike[]),
  ];

  if (!rawProfiles.length) {
    return {
      years: "-",
      grades: "-",
      classes: "-",
      mediums: "-",
      subjects: "-",
    };
  }

  const years = new Set<string>();
  const grades = new Set<string>();
  const classes = new Set<string>();
  const mediums = new Set<string>();
  const subjects = new Set<string>();

  rawProfiles.forEach((p) => {
    if (p.academicYear) years.add(p.academicYear);
    if (p.academicMedium) mediums.add(p.academicMedium);
    if (p.grade?.grade) grades.add(p.grade.grade);
    if (p.class?.className) classes.add(p.class.className);

    const basketSubjects = p.basketSubjects ?? {};
    Object.values(basketSubjects).forEach((s) => {
      if (s?.subjectName) {
        subjects.add(s.subjectName);
      }
    });
  });

  const join = (set: Set<string>) =>
    set.size ? Array.from(set).join(", ") : "-";

  return {
    years: join(years),
    grades: join(grades),
    classes: join(classes),
    mediums: join(mediums),
    subjects: join(subjects),
  };
};

export const generateUsersPdf = ({ users, headerData }: ExportPayload) => {
  const dataset = Array.isArray(users) ? users : [];

  if (!dataset.length) {
    throw new Error("No user data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");

  const title = headerData?.title || "Users Report";
  const mode: UserExportMode = headerData?.mode ?? "summary";

  const commonHeader = [
    "#",
    "Id",
    "Staff / Admission Number",
    "Name With Initials",
    "Full Name",
    "Email",
    "Mobile Number",
    "User Name",
    "Address",
    "Birthday",
    "Gender",
    "User Role",
    "Access Role",
    "Status",
  ];

  const buildBaseUserRow = (user: User) => {
    const birthday = user.birthDate
      ? format(new Date(user.birthDate), "yyyy-MM-dd")
      : "--";

    const status = user.availability ? "Active" : "Inactive";

    return [
      "", // placeholder for row index, will be filled later
      formatCellValue(user.id),
      formatCellValue(user.employeeNumber ?? "--"),
      formatCellValue(user.nameWithInitials),
      formatCellValue(user.name),
      formatCellValue(user.email),
      formatCellValue(user.mobile),
      formatCellValue(user.userName),
      formatCellValue(getPlainAddress(user.address)),
      formatCellValue(birthday),
      formatCellValue(user.gender),
      formatCellValue(user.employeeType ?? "--"),
      formatCellValue(user.userType?.userType ?? "--"),
      formatCellValue(status),
    ];
  };

  let headRow: string[] = [];
  const body: RowInput[] = [];

  if (mode === "profileRows") {
    headRow = [
      ...commonHeader,
      "Year",
      "Grade",
      "Class",
      "Subject",
      "Medium",
    ];

    let rowIndex = 0;

    dataset.forEach((user) => {
      const baseRowWithoutIndex = buildBaseUserRow(user).slice(1); // drop placeholder index
      const emptyBaseRowWithoutIndex = baseRowWithoutIndex.map(() => "");

      const teacherProfiles = (((user as any).userProfile ?? []) as ProfileLike[]);
      const studentProfiles = (((user as any).studentProfile ?? []) as ProfileLike[]);

      let isFirstRowForUser = true;

      const pushAcademicRow = (
        year?: string,
        grade?: string,
        className?: string,
        subject?: string,
        medium?: string
      ) => {
        rowIndex += 1;
        const commonPart = isFirstRowForUser
          ? baseRowWithoutIndex
          : emptyBaseRowWithoutIndex;
        body.push([
          rowIndex.toString(),
          ...commonPart,
          formatCellValue(year ?? "-"),
          formatCellValue(grade ?? "-"),
          formatCellValue(className ?? "-"),
          formatCellValue(subject ?? "-"),
          formatCellValue(medium ?? "-"),
        ]);
        isFirstRowForUser = false;
      };

      teacherProfiles.forEach((p) => {
        const year = p.academicYear;
        const grade = p.grade?.grade;
        const className = p.class?.className;
        const subject = (p as any).subject?.subjectName as string | undefined;
        const medium = p.academicMedium;

        pushAcademicRow(year, grade, className, subject, medium);
      });

      studentProfiles.forEach((p) => {
        const year = p.academicYear;
        const grade = p.grade?.grade;
        const className = p.class?.className;
        const medium = p.academicMedium;

        const basketSubjects = p.basketSubjects ?? {};
        const subjectEntries = Object.values(basketSubjects);

        if (!subjectEntries.length) {
          pushAcademicRow(year, grade, className, undefined, medium);
        } else {
          subjectEntries.forEach((s) => {
            pushAcademicRow(year, grade, className, s.subjectName, medium);
          });
        }
      });

      if (!teacherProfiles.length && !studentProfiles.length) {
        pushAcademicRow();
      }
    });
  } else {
    headRow = [
      ...commonHeader,
      "Profile Years",
      "Profile Grades",
      "Profile Classes",
      "Profile Mediums",
      "Profile Subjects",
    ];

    let rowIndex = 0;

    dataset.forEach((user) => {
      const baseRowWithoutIndex = buildBaseUserRow(user).slice(1);
      const profileSummary = getUserProfileSummary(user);

      rowIndex += 1;
      body.push([
        rowIndex.toString(),
        ...baseRowWithoutIndex,
        formatCellValue(profileSummary.years),
        formatCellValue(profileSummary.grades),
        formatCellValue(profileSummary.classes),
        formatCellValue(profileSummary.mediums),
        formatCellValue(profileSummary.subjects),
      ]);
    });
  }

  autoTable(doc, {
    startY: TABLE_MARGIN_TOP,
    head: [headRow],
    body,
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
    margin: {
      top: TABLE_MARGIN_TOP,
      bottom: TABLE_MARGIN_BOTTOM,
      left: 10,
      right: 10,
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });
      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "users-report"}-${timestamp}.pdf`);
};
