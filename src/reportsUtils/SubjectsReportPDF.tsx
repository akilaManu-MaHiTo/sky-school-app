import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface Subject {
  id: number;
  subjectCode: string;
  subjectMedium: string;
  subjectName: string;
  isBasketSubject: number;
  created_at: string;
  updated_at: string;
}

export interface LetterSubjects {
  letter: string;
  subjects: Subject[] | "No subjects";
}

export const generatePdf = (
  data: LetterSubjects[],
  headerData?: PdfHeaderData
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw header (logo + org name + system info)
  drawPdfHeader(doc, headerData);

  let startY = 50; // start below header
  let pageNumber = 1;

  // Document title at top
  const title = headerData?.title || "Subject Report";
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(2, 66, 113);
  doc.text(title, 15, startY);

  startY += 8;

  // Summary info
  const totalSubjects = data.reduce((sum, group) => {
    return sum + (group.subjects === "No subjects" ? 0 : group.subjects.length);
  }, 0);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(`Total Subjects: ${totalSubjects}`, 15, startY);
  

  startY += 10;

  // Loop through each letter section
  data.forEach((group) => {
    if (group.subjects !== "No subjects") {
      if (startY > pageHeight - 50) {
        doc.addPage();
        drawPdfHeader(doc, {
          ...headerData,
          title: "Subject Report (Continued)",
        });
        startY = 50;
      }

      // Section heading: Letter only, no subject count
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Letter ${group.letter} - Subjects`, 15, startY);

      startY += 6;

      // Table
      const tableData = group.subjects.map((sub, index) => [
        (index + 1).toString(),
        sub.subjectCode || "N/A",
        sub.subjectMedium || "N/A",
        sub.subjectName,
        sub.isBasketSubject === 1 ? "Yes" : "No",
        new Date(sub.created_at).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY,
        head: [["#", "Code", "Medium", "Subject Name", "Basket", "Created"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 30, 30],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 70, halign: "left" },
          4: { cellWidth: 15, halign: "center" },
          5: { cellWidth: 25, halign: "center" },
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (dataArg) => {
          drawPdfFooter(doc, pageNumber, headerData?.organizationName);

          if (dataArg.pageNumber > pageNumber) {
            pageNumber = dataArg.pageNumber;
            drawPdfHeader(doc, {
              ...headerData,
              title: "Subject Report (Continued)",
            });
            startY = 50;
          }
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }
  });

  const timestamp = new Date().toISOString().split("T")[0];
  doc.save(`subjects-report-${timestamp}.pdf`);
};
