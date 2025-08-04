import React, { useRef } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { notify } from "./Notification"; // Adjust import path as needed

const PDFExport = ({
  elementId,
  fileName = "document",
  buttonText = "Export to PDF",
  buttonClass = "",
  pdfOptions = {},
}) => {
  const buttonRef = useRef(null);

  const handleExport = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }

      // Show loading state
      if (buttonRef.current) {
        buttonRef.current.disabled = true;
      }

      // Default PDF options
      const defaultOptions = {
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        ...pdfOptions,
      };

      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Convert to PDF
      const pdf = new jsPDF(defaultOptions);
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);

      notify.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      notify.error("Failed to export PDF");
    } finally {
      if (buttonRef.current) {
        buttonRef.current.disabled = false;
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleExport}
      className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${buttonClass}`}
    >
      <Download size={18} />
      {buttonText}
    </button>
  );
};

export default PDFExport;
