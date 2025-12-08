import jsPDF from "jspdf";

export const drawPdfFooter = (
  doc: jsPDF,
  pageNumber: number,
  organizationName: string = "Organization"
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const footerY = pageHeight - 15;

  // Horizontal separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  // Left footer text
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`${organizationName} - School Management System`, 15, footerY);

  // Right footer text: Page number
  doc.setFont("helvetica", "bold");
  const pageText = `Page ${pageNumber}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - pageTextWidth - 15, footerY);
};
