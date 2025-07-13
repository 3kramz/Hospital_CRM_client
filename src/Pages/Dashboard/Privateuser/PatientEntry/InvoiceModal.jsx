import JsBarcode from "jsbarcode";
import html2pdf from "html2pdf.js";
import { useEffect, useRef } from "react";

const InvoiceModal = ({
  isOpen,
  onClose,
  patientInfo,
  tests,
  total,
  totalDiscount,
  vat,
  previousDue,
  payment,
  updatedDue,
  grandTotal,
  autoPrint = false,
}) => {
  const printRef = useRef();
  const barcodeRef = useRef();

  const handlePrint = () => {
    if (printRef.current) {
      html2pdf()
        .set({
          margin: 0,
          filename: `${patientInfo?.name}-invoice.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
        })
        .from(printRef.current)
        .save();
    }
  };

  useEffect(() => {
    if (barcodeRef.current && patientInfo?.patientId) {
      JsBarcode(barcodeRef.current, patientInfo.patientId.toString(), {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });
    }
  }, [patientInfo]);

  useEffect(() => {
    if (isOpen && autoPrint) {
      setTimeout(() => {
        handlePrint();
      }, 1000);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen || !patientInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center print:hidden">
      <div className="relative w-[1440px] h-[1165px] bg-[#70aad8] overflow-hidden rounded-lg shadow-xl">
        <div
          ref={printRef}
          className="relative w-full h-full text-black bg-[#70aad8]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white text-red-600 px-3 py-1 rounded shadow print:hidden"
          >
            ✖
          </button>

          {/* Header Banner */}

          {/* Invoice Container */}
          <div className="absolute w-[960px] h-[1064px] top-[77px] left-[312px] bg-neutral-100 rounded-md shadow-md px-6 py-10">
            <div className="absolute w-[964px] h-12 left-px">
              <div className="relative w-[960px] h-12 bg-[#70aad8] border border-solid border-black shadow">
                <div className="absolute w-[310px] top-1 left-[327px] font-semibold text-white text-[32px]">
                  MEDICAL INVOICE
                </div>
                <div className="absolute w-[139px] top-3.5 left-[638px] text-white text-sm">
                  -CUSTOMER COPY
                </div>
              </div>
            </div>

            {/* Header Details */}
            <div className="bg-[#c9e7ff] rounded-lg p-6 mb-6 space-y-4 mt-20">
              <div className="grid grid-cols-2 gap-y-2 text-xl font-semibold">
                <div className="flex">
                  <span className="w-40">BILL NO:</span>
                  <span>{patientInfo?.billNo || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="w-40">DATE & TIME:</span>
                  <span>{new Date().toLocaleString("en-GB")}</span>
                </div>
                <div className="flex">
                  <span className="w-40">NAME:</span>
                  <span>{patientInfo.name}</span>
                </div>
                <div className="flex">
                  <span className="w-40">PATIENT ID:</span>
                  <span>{patientInfo.patientId}</span>
            <svg
              ref={barcodeRef}
              className="mb-4 w-[150px] h-[50px] float-right mr-10"
              aria-label="Patient Barcode"
            />
                </div>
                <div className="flex">
                  <span className="w-40">AGE:</span>
                  <span>{patientInfo.age}</span>
                </div>
                <div className="flex">
                  <span className="w-40">GENDER:</span>
                  <span>{patientInfo.gender}</span>
                </div>
                <div className="flex">
                  <span className="w-40">REFF. DOC.:</span>
                  <span>{patientInfo.refDoctor}</span>
                </div>
                <div className="flex">
                  <span className="w-40">MOBILE:</span>
                  <span>{patientInfo.contact}</span>
                </div>
              </div>
            </div>

            {/* Barcode */}

            {/* Test Table Header */}
            <div className="w-full h-[45px] bg-[#c9e7ff] rounded-[10px] flex justify-between px-6 items-center text-black font-semibold text-xl mb-2">
              <div>SI NO</div>
              <div>TEST NAME</div>
              <div>PRICE</div>
            </div>

            {/* Test List */}
            <div className="space-y-1 mb-6">
              {tests?.map((test, index) => (
                <div key={index} className="flex justify-between px-6 text-xl">
                  <div>{index + 1}</div>
                  <div>{test.name}</div>
                  <div>{Number(test.price).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="text-xl text-right pr-6 space-y-1 mb-4">
              <p>Total: {total.toFixed(2)}</p>
              <p>Discount: {totalDiscount.toFixed(2)}</p>
              <p>VAT: {vat.toFixed(2)}</p>
              <p>Previous Due: {previousDue.toFixed(2)}</p>
              <p className="font-bold">Final Total: {grandTotal.toFixed(2)}</p>
              <p>Payment: {payment.toFixed(2)}</p>
              <p className="text-red-600 font-bold">
                Due: {updatedDue.toFixed(2)}
              </p>
            </div>

            {/* Stamp */}
            {updatedDue === 0 ? (
              <div className="absolute top-[695px] left-[211px] rotate-[-34deg] p-2 border-2 border-black bg-[#337ab236] text-center text-green-700 font-bold text-4xl select-none">
                PAID
              </div>
            ) : (
              <div className="absolute top-[695px] left-[211px] rotate-[-34deg] p-2 border-2 border-black bg-red-100 text-center text-red-700 font-bold text-4xl select-none">
                DUE: {updatedDue.toFixed(2)}
              </div>
            )}

            {/* Footer in Bengali */}
            <p className="text-xl mt-10">
              প্রিন্ট তারিখ ও সময়: {new Date().toLocaleString("bn-BD")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
