import React, { forwardRef } from "react";
import InvoiceHeader from "./InvoiceHeader";
import PatientDetails from "./PatientDetails";
import InvoiceItemsTable from "./InvoiceItemsTable";
import InvoicePaymentSummary from "./InvoicePaymentSummary";
import InvoiceFooter from "./InvoiceFooter";

const InvoiceContent = forwardRef(({ invoiceData, user }, ref) => {
  const {
    patientInfo,
    tests,
    previousDue,
    totalDiscount,
    payment,
    grandTotal,
    pid,
    createdAt,
    _id,
    invoiceId,
    enteredBy,
  } = invoiceData;

  const testTotal = tests.reduce((sum, t) => sum + t.price, 0);
  const discountTotal =
    totalDiscount || tests.reduce((sum, t) => sum + (t.discount || 0), 0);
  const netTotal = testTotal - discountTotal + previousDue;
  const due = netTotal - payment;

  // Extract unique room numbers
  const uniqueRooms = Array.from(new Set(
    tests
      .filter(t => t.roomNumber)
      .map(t => `${t.roomNumber} (${t.department || 'General'})`)
  )).join(", ");

  return (
    <div
      ref={ref}
      className="print-container w-full max-w-4xl mx-auto bg-white p-10 print:p-4 font-sans relative text-gray-800 print:text-sm"
    >
      {/* PAID / DUE Watermark */}
      <div
        className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black tracking-widest opacity-[0.08] select-none pointer-events-none rotate-[-45deg] border-8 rounded-xl px-10 py-4
          ${due <= 0 ? "text-green-600 border-green-600" : "text-red-500 border-red-500"}`}
      >
        {due <= 0 ? "PAID" : "DUE"}
      </div>

      <style type="text/css" media="print">
        {`
           @page { size: A5 portrait; margin: 5mm; }
           body { -webkit-print-color-adjust: exact; }
           .print-container { 
              width: 100%;
              position: relative;
              zoom: 85%; /* Scale down to fit A5 */
           }
           /* Ensure text remains legible but compact */
           .print-container * {
              font-size: 10px !important;
              line-height: 1.2 !important;
           }
           .print-container h1 { font-size: 16px !important; }
           .print-container h2 { font-size: 14px !important; }
           
           /* Super compact table */
           .print-container td, .print-container th { 
              padding-top: 2px !important; 
              padding-bottom: 2px !important;
           }
           
           /* Remove any unnecessary spacing */
           .print-container p { margin-bottom: 2px !important; }
        `}
      </style>

      <InvoiceHeader 
        invoiceId={invoiceId} 
        _id={_id} 
        createdAt={createdAt} 
        pid={pid} 
      />

      <PatientDetails 
        patientInfo={patientInfo} 
        createdAt={createdAt} 
      />

      <InvoiceItemsTable 
        tests={tests} 
      />

      <InvoicePaymentSummary
        testTotal={testTotal}
        discountTotal={discountTotal}
        previousDue={previousDue}
        grandTotal={grandTotal}
        payment={payment}
        due={due}
      />

      <InvoiceFooter 
        enteredBy={enteredBy} 
        user={user} 
        uniqueRooms={uniqueRooms}
      />
    </div>
  );
});

export default InvoiceContent;