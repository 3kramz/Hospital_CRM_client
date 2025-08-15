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

  const handlePrint = useReactToPrint({
  contentRef: invoiceRef,
  documentTitle: invoiceData
    ? `Invoice_${invoiceData.patientInfo.pid}`
    : "Invoice",
  // onBeforePrint: () => {
  //   console.log("Invoice ref content:", invoiceRef.current);
  //   console.log("Inner HTML:", invoiceRef.current?.innerHTML);
  // }
});

  if (!invoiceData) return <p>Loading Invoice...</p>;

  return (
    <div className="p-4">
      <button
        onClick={handlePrint}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
      >
        Print Now
      </button>
      <InvoiceContent ref={invoiceRef} invoiceData={invoiceData} />
    </div>
  );
}
