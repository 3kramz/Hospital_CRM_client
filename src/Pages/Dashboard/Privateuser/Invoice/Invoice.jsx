import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../../../Hook/useAxios";
import { useReactToPrint } from "react-to-print";
import InvoiceContent from "./InvoiceContent";

export default function Invoice() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef(null);
  const buttonContainerRef = useRef(null);

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
    const handleClickOutside = (event) => {
        // If clicking on invoice or buttons, do nothing
        if (
            (invoiceRef.current && invoiceRef.current.contains(event.target)) ||
            (buttonContainerRef.current && buttonContainerRef.current.contains(event.target))
        ) {
            return;
        }

        // Logic to go back or to dashboard
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
             navigate('/dashboard');
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate]);


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
    <div className="p-4 min-h-screen bg-gray-100 flex flex-col items-center">
      <div ref={buttonContainerRef} className="w-full max-w-4xl flex justify-start mb-4">
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2 shadow-sm"
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
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-sm"
          >
            Close
          </button>
      </div>
      <div className="w-full max-w-4xl shadow-lg bg-white">
         <InvoiceContent ref={invoiceRef} invoiceData={invoiceData} />
      </div>
    </div>
  );
}
