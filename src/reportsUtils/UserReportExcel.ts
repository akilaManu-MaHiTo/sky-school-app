import * as XLSX from "xlsx";
import { format } from "date-fns";
import { User } from "../api/userApi";
import { getPlainAddress } from "../util/plainText.util";

export type UserExportMode = "summary" | "profileRows";

export interface UserReportExcelOptions {
  fileName?: string;
  mode?: UserExportMode;
}

interface ExportPayload {
  users: User[];
  options?: UserReportExcelOptions;
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
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
    // include child academic profiles for parents
    ...(((user as any).parentProfile ?? [])
      .flatMap((pp: any) => pp.academicProfiles ?? []) as ProfileLike[]),
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

export const exportUsersToExcel = ({ users, options }: ExportPayload) => {
  const dataset = Array.isArray(users) ? users : [];

  if (!dataset.length) {
    return;
  }

  const mode: UserExportMode = options?.mode ?? "summary";

  const commonHeader = [
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

  let header: string[] = [];
  const body: (string | number)[][] = [];

  if (mode === "profileRows") {
    header = [
      ...commonHeader,
      "Student Name",
      "Student Email",
      "Student Mobile",
      "Year",
      "Grade",
      "Class",
      "Subject",
      "Medium",
    ];

    dataset.forEach((user) => {
      const baseRow = buildBaseUserRow(user);
      const emptyBaseRow = baseRow.map(() => "");

      const teacherProfiles = (((user as any).userProfile ?? []) as ProfileLike[]);
      const studentProfiles = (((user as any).studentProfile ?? []) as ProfileLike[]);
      const parentProfiles = (((user as any).parentProfile ?? []) as any[]);

      let isFirstRowForUser = true;

      const pushAcademicRow = (
        year?: string,
        grade?: string,
        className?: string,
        subject?: string,
        medium?: string,
        studentName?: string,
        studentEmail?: string,
        studentMobile?: string
      ) => {
        const commonPart = isFirstRowForUser ? baseRow : emptyBaseRow;
        body.push([
          ...commonPart,
          formatCellValue(studentName ?? "-"),
          formatCellValue(studentEmail ?? "-"),
          formatCellValue(studentMobile ?? "-"),
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

      // For Parent users, include their children's academicProfiles with student details
      parentProfiles.forEach((pp: any) => {
        const studentName = pp.name as string | undefined;
        const studentEmail = pp.email as string | undefined;
        const studentMobile = pp.mobile as string | undefined;

        const childProfiles = ((pp.academicProfiles ?? []) as ProfileLike[]);

        if (!childProfiles.length) {
          pushAcademicRow(undefined, undefined, undefined, undefined, undefined, studentName, studentEmail, studentMobile);
          return;
        }

        childProfiles.forEach((p) => {
          const year = p.academicYear;
          const grade = p.grade?.grade;
          const className = p.class?.className;
          const medium = p.academicMedium;

          const basketSubjects = p.basketSubjects ?? {};
          const subjectEntries = Object.values(basketSubjects);

          if (!subjectEntries.length) {
            pushAcademicRow(year, grade, className, undefined, medium, studentName, studentEmail, studentMobile);
          } else {
            subjectEntries.forEach((s) => {
              pushAcademicRow(year, grade, className, s.subjectName, medium, studentName, studentEmail, studentMobile);
            });
          }
        });
      });

      // If user has no academic profiles at all, still emit one row so they appear
      if (
        !teacherProfiles.length &&
        !studentProfiles.length &&
        !parentProfiles.length
      ) {
        pushAcademicRow();
      }
    });
  } else {
    // summary mode (default) with condensed profile information
    header = [
      ...commonHeader,
      "Profile Years",
      "Profile Grades",
      "Profile Classes",
      "Profile Mediums",
      "Profile Subjects",
    ];

    dataset.forEach((user) => {
      const baseRow = buildBaseUserRow(user);
      const profileSummary = getUserProfileSummary(user);

      body.push([
        ...baseRow,
        formatCellValue(profileSummary.years),
        formatCellValue(profileSummary.grades),
        formatCellValue(profileSummary.classes),
        formatCellValue(profileSummary.mediums),
        formatCellValue(profileSummary.subjects),
      ]);
    });
  }

  const worksheetData = [header, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const baseName = "users";
  const timestamp = new Date().toISOString().split("T")[0];
  const safeBaseName = baseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName =
    options?.fileName || `${safeBaseName}-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
