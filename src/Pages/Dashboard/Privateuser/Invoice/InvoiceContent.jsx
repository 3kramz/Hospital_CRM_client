import React, { forwardRef } from "react";
import JsBarcode from "jsbarcode";

const InvoiceContent = forwardRef(({ invoiceData }, ref) => {
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
  } = invoiceData;
console.log(previousDue)
  const testTotal = tests.reduce((sum, t) => sum + t.price, 0);
  const discountTotal =
    totalDiscount || tests.reduce((sum, t) => sum + (t.discount || 0), 0);
  const netTotal = testTotal - discountTotal + previousDue;
  const due = netTotal - payment;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB");

  // Barcode generation
  const barcodeRef = React.useRef();
  React.useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, pid, {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 25,
      });
    }
  }, [pid]);

  return (
    <div
      ref={ref}
      className="print-container p-6 max-w-3xl mx-auto bg-white border shadow-sm relative"
    >
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Jazeera Diagnostic Center</h1>
          <p>Laxipur Mor, Rajshahi, 6000</p>
          <p>
            Phone: +8801343524436 <br /> Email: info@webnestsolution.com
          </p>
        </div>
        <div className="text-right">
          <p>Invoice ID: {_id.slice(-6)}</p>
          <p>Date: {formatDate(createdAt)}</p>
        </div>
      </div>

      {/* PAID / DUE Stamp */}
      <div
        className="absolute top-150 left-20 text-8xl font-bold text-red-500 opacity-20 select-none pointer-events-none"
        style={{ transform: "rotate(-45deg)" }}
      >
        {due <= 0 ? "PAID" : "DUE"}
      </div>

      {/* Patient Info */}
      <div className="mb-4 border p-2">
        <h2 className="font-semibold text-lg mb-2">Patient Information</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>
            <strong>Name:</strong> {patientInfo.name}
          </p>
          <p>
            <strong>Age:</strong> {patientInfo.age}
          </p>
          <p>
            <strong>Gender:</strong> {patientInfo.gender}
          </p>
          <p>
            <strong>Phone:</strong> {patientInfo.phone}
          </p>
          <p>
            <strong>Address:</strong> {patientInfo.address || "-"}
          </p>
          <p>
            <strong>Email:</strong> {patientInfo.email || "-"}
          </p>
          <p>
            <strong>Ref Doctor:</strong> {patientInfo.refDoctor || "-"}
          </p>
          <p>
            <strong>PC Name:</strong> {patientInfo.pcName || "-"}
          </p>
          <p>
            <strong>Previous Due:</strong> {previousDue || 0}
          </p>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-2">
              <strong>Patient ID:</strong>
              <svg className="mt-2" ref={barcodeRef}></svg>
            </p>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="mb-4">
        <h2 className="font-semibold text-lg mb-2">Tests</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Test Name</th>
              <th className="border p-2 text-right">Price</th>
              <th className="border p-2 text-right">Discount</th>
              <th className="border p-2 text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, i) => (
              <tr key={i}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{t.testName}</td>
                <td className="border p-2 text-right">{t.price}</td>
                <td className="border p-2 text-right">{t.discount || 0}</td>
                <td className="border p-2 text-right">
                  {t.price - (t.discount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Summary */}
      <div className="flex justify-end">
        <table className="w-1/2 text-sm">
          <tbody>
            <tr>
              <td className="p-2 font-semibold">Total Tests Amount:</td>
              <td className="p-2 text-right">{testTotal}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Total Discount:</td>
              <td className="p-2 text-right">{discountTotal}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Grand Total:</td>
              <td className="p-2 text-right">{grandTotal}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Payment:</td>
              <td className="p-2 text-right">{payment}</td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Due:</td>
              <td className="p-2 text-right">{due}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-600">
        <p>Thank you for choosing our Diagnostic Center!</p>
        <p>
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>
    </div>
  );
});

export default InvoiceContent;
