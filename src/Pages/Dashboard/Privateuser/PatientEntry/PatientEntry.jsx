import { useEffect, useState } from "react";
import InvoiceModal from "./InvoiceModal";
import html2pdf from "html2pdf.js";

// Simulated patient DB
const mockPatients = [
  {
    patientId: "PID1001",
    name: "Alice Johnson",
    age: 34,
    gender: "Female",
    contact: "9991110000",
    refDoctor: "Dr. Roy",
    pcName: "PC-101",
    dueAmount: 200,
  },
  {
    patientId: "PID1002",
    name: "Bob Smith",
    age: 45,
    gender: "Male",
    contact: "8882221111",
    refDoctor: "Dr. Gupta",
    pcName: "PC-102",
    dueAmount: 0,
  },
];

const PatientEntry = () => {
  const [tests, setTests] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [previousDue, setPreviousDue] = useState(0);
  const [payment, setPayment] = useState(0);
  const [updatedDue, setUpdatedDue] = useState(0);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [triggerPrint, setTriggerPrint] = useState(false);

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    refDoctor: "",
    pcName: "",
    patientId: "",
  });

  // On mount, load selected tests from localStorage (mock)
  useEffect(() => {
    const storedTests = JSON.parse(localStorage.getItem("selectedTests")) || [];
    setTests(storedTests);
    const initialDiscounts = {};
    storedTests.forEach((test) => {
      initialDiscounts[test.test_id] = 0;
    });
    setDiscounts(initialDiscounts);
  }, []);

  const handleDiscountChange = (testId, value) => {
    setDiscounts((prev) => ({
      ...prev,
      [testId]: parseFloat(value) || 0,
    }));
  };

  const calculateAmount = (price, discount) => price - (discount || 0);

  const total = tests.reduce((sum, test) => sum + test.price, 0);
  const totalDiscount = tests.reduce(
    (sum, test) => sum + (discounts[test.test_id] || 0),
    0
  );
  const vat = 0.05 * (total - totalDiscount);
  const grandTotal = total - totalDiscount + vat;
  const finalTotal = grandTotal + previousDue;

  useEffect(() => {
    setUpdatedDue(Math.max(finalTotal - payment, 0));
  }, [payment, finalTotal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.patientId.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handlePatientSelect = (patient) => {
    setPatientInfo(patient);
    setPreviousDue(patient.dueAmount || 0);
    setSearchQuery(`${patient.name} (${patient.patientId})`);
    setSuggestions([]);
  };

  const handleSave = async () => {
    let finalPatient = { ...patientInfo };

    if (!finalPatient.patientId || finalPatient.patientId.startsWith("PIDNEW")) {
      finalPatient.patientId = "PID" + Date.now();
    }

    const billData = {
      patientInfo: finalPatient,
      tests,
      discounts,
      payment,
      previousDue,
      updatedDue,
      grandTotal: finalTotal,
    };

    try {
      const res = await fetch("/api/patient-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      const data = await res.json();
      if (data.success) {
        alert("Bill saved to backend successfully.");
      }
    } catch (err) {
      console.error("Error saving bill:", err);
      alert("Failed to save.");
    }
  };

  // Print invoice using html2pdf when triggered
  useEffect(() => {
    if (isInvoiceOpen && triggerPrint) {
      const element = document.querySelector(".print-area");
      if (!element) {
        setTriggerPrint(false);
        return;
      }
      // Delay a bit to ensure modal content rendered
      setTimeout(() => {
        html2pdf()
          .set({
            margin: 0.3,
            filename: `invoice_${Date.now()}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          })
          .from(element)
          .outputPdf("bloburl")
          .then((pdfUrl) => {
            window.open(pdfUrl, "_blank");
            setTriggerPrint(false);
            setIsInvoiceOpen(false);
          })
          .catch((err) => {
            console.error("PDF generation error:", err);
            setTriggerPrint(false);
            setIsInvoiceOpen(false);
          });
      }, 300);
    }
  }, [isInvoiceOpen, triggerPrint]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-10">
        <h2 className="text-3xl font-bold text-center text-white bg-primary py-2 rounded">
          Patient Entry
        </h2>

        {/* Search Patient */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Patient ID or Name"
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full mt-1 z-50 shadow max-h-60 overflow-y-auto">
              {suggestions.map((p) => (
                <li
                  key={p.patientId}
                  onClick={() => handlePatientSelect(p)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.name} ({p.patientId})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={patientInfo.name}
            onChange={handleInputChange}
            placeholder="Patient Name"
            className="input"
          />
          <input
            type="number"
            name="age"
            value={patientInfo.age}
            onChange={handleInputChange}
            placeholder="Age"
            className="input"
          />
          <select
            name="gender"
            value={patientInfo.gender}
            onChange={handleInputChange}
            className="input"
          >
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <input
            type="text"
            name="contact"
            value={patientInfo.contact}
            onChange={handleInputChange}
            placeholder="Contact"
            className="input"
          />
          <input
            type="text"
            name="refDoctor"
            value={patientInfo.refDoctor}
            onChange={handleInputChange}
            placeholder="Ref. Doctor"
            className="input"
          />
          <input
            type="text"
            name="pcName"
            value={patientInfo.pcName}
            onChange={handleInputChange}
            placeholder="PC Name"
            className="input"
          />
        </div>

        {/* Billing Table */}
        <div>
          <h3 className="text-xl font-semibold text-center text-white bg-primary py-2 rounded">
            Diagnoses and Billing
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-t border-b border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Test</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Discount</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.test_id} className="border-t">
                    <td className="p-2">{test.name}</td>
                    <td className="p-2">{test.price}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={discounts[test.test_id] || ""}
                        onChange={(e) =>
                          handleDiscountChange(test.test_id, e.target.value)
                        }
                        className="border rounded px-2 py-1 w-24"
                      />
                    </td>
                    <td className="p-2 font-semibold">
                      {calculateAmount(test.price, discounts[test.test_id] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Billing Summary */}
          <div className="mt-6 text-right space-y-2">
            <p>Total: {total.toFixed(2)}</p>
            <p>Discount: {totalDiscount.toFixed(2)}</p>
            <p>VAT (5%): {vat.toFixed(2)}</p>
            <p>Previous Due: {previousDue.toFixed(2)}</p>
            <p className="font-bold">
              Current Grand Total: {grandTotal.toFixed(2)}
            </p>
            <p className="text-blue-700 font-semibold">
              Final Total (incl. Due): {finalTotal.toFixed(2)}
            </p>

            <div className="flex justify-end items-center gap-2">
              <label>Payment:</label>
              <input
                type="number"
                min="0"
                value={payment}
                onChange={(e) => setPayment(parseFloat(e.target.value) || 0)}
                className="border rounded px-2 py-1 w-32"
              />
            </div>

            <p className="text-red-600 font-bold">
              Due After Payment: {updatedDue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 flex-wrap">
          <button
            onClick={() => {
              setTests([]);
              localStorage.clear();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-700"
          >
            Preview Invoice
          </button>
          <button
            onClick={() => {
              setIsInvoiceOpen(true);
              setTriggerPrint(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
          >
            Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setTriggerPrint(false);
        }}
        patientInfo={patientInfo}
        tests={tests}
        total={total}
        totalDiscount={totalDiscount}
        vat={vat}
        previousDue={previousDue}
        payment={payment}
        updatedDue={updatedDue}
        grandTotal={finalTotal}
      />
    </div>
  );
};

export default PatientEntry;
