import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosPublic } from "../../../../Hook/useAxios";
import { useReactToPrint } from "react-to-print";
import InvoiceContent from "./InvoiceContent";

export default function Invoice() {
  const { groupId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    axiosPublic.get(`/save-patient-bill/${groupId}`)
      .then(res =>setInvoiceData(res.data))
      .catch(err => {
        console.error("Failed to fetch invoice data:", err);
        setInvoiceData(null);
      });
  }, [groupId]);

  useEffect(() => {
    // console.log("InvoiceRef changed:", invoiceRef.current);
  }, [invoiceData]);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: invoiceData
      ? `Invoice_${invoiceData.patientInfo.pid}`
      : "Invoice",
    onAfterPrint: () => {},
    onBeforePrint: async () => {},
    onPrintError: (loc, err) => console.error("Print Error:", loc, err)
  });

  // Handle Enter key for printing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handlePrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrint]);

  if (!invoiceData) return <p>Loading Invoice...</p>;

  return (
    <div className="p-4">
      <button
        onClick={handlePrint}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700 mr-2"
      >
        Print Now
      </button>
      <button
        onClick={() => {
           if (window.history.length > 1) {
              window.history.back();
           } else {
              window.close();
           }
        }}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4 hover:bg-red-600"
      >
        Close
      </button>
      <InvoiceContent ref={invoiceRef} invoiceData={invoiceData} />
    </div>
  );
}
