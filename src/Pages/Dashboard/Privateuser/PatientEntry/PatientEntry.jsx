import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";

const PatientEntry = () => {
  const axiosSecure = useAxiosSecure();

  // Patient Info & Search
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    refDoctor: "",
    pcName: "",
    pid: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Ref Doctor Search
  const [refDoctorQuery, setRefDoctorQuery] = useState("");
  const [refDoctorSuggestions, setRefDoctorSuggestions] = useState([]);

  // Tests and discounts
  const [tests, setTests] = useState([]);
  const [discounts, setDiscounts] = useState({});

  // Billing info
  const [previousDue, setPreviousDue] = useState(0);
  const [payment, setPayment] = useState(0);
  const [updatedDue, setUpdatedDue] = useState(0);

  // === Patient Search (debounced) ===
  const searchPatients = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axiosSecure.get(`/patients/search?q=${query}`);
        setSuggestions(data);
      } catch (err) {
        console.error("Error searching patients:", err);
        setSuggestions([]);
      }
    }, 400),
    [axiosSecure]
  );

  const searchRefDoctors = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setRefDoctorSuggestions([]);
        return;
      }
      try {
        const { data } = await axiosSecure.get(`/doctors/search?q=${query}`);
        setRefDoctorSuggestions(data);
      } catch (err) {
        console.error("Error searching doctors:", err);
        setRefDoctorSuggestions([]);
      }
    }, 400),
    [axiosSecure]
  );

  // Handlers
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    searchPatients(val);
  };

  const handlePatientSelect = (patient) => {
    setPatientInfo({
      name: patient.name,
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      refDoctor: patient.refDoctor || "",
      pcName: patient.pcName || "",
      pid: patient.pid || "",
    });
    setPreviousDue(patient.dueAmount || 0);
    setSearchQuery(`${patient.name} (${patient.pid})`);
    setSuggestions([]);
  };

  const handleRefDoctorChange = (e) => {
    const val = e.target.value;
    setPatientInfo((prev) => ({ ...prev, refDoctor: val }));
    setRefDoctorQuery(val);
    searchRefDoctors(val);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Load tests from localStorage on mount
  useEffect(() => {
    const storedTests = JSON.parse(localStorage.getItem("selectedTests")) || [];
    setTests(storedTests);

    // Initialize discounts for each test to 0
    const initialDiscounts = {};
    storedTests.forEach((test) => {
      initialDiscounts[test.test_id] = 0;
    });
    setDiscounts(initialDiscounts);
  }, []);

  const handleDiscountChange = (testId, val) => {
    setDiscounts((prev) => ({
      ...prev,
      [testId]: parseFloat(val) || 0,
    }));
  };

  // Billing calculations (without VAT as requested)
  const total = tests.reduce((sum, t) => sum + t.price, 0);
  const totalDiscount = tests.reduce(
    (sum, t) => sum + (discounts[t.test_id] || 0),
    0
  );
  const grandTotal = total - totalDiscount;
  const finalTotal = grandTotal + previousDue;

  useEffect(() => {
    setUpdatedDue(Math.max(finalTotal - payment, 0));
  }, [payment, finalTotal]);

  // Save & Print handler
  const handleSaveAndPrint = async () => {
    try {
      let finalPatient = { ...patientInfo };

      // Clear pid if new patient to trigger creation on backend
      if (!finalPatient.pid || finalPatient.pid.startsWith("PIDNEW")) {
        finalPatient.pid = "";
      }

      const billData = {
        patientInfo: finalPatient,
        tests,
        discounts,
        payment,
        updatedDue,
        grandTotal: finalTotal,
      };

      const { data } = await axiosSecure.post("/save-patient-bill", billData);

      if (data.success) {
        alert("Bill saved successfully.");

        // Update pid if new patient created
        if (!finalPatient.pid) {
          setPatientInfo((prev) => ({ ...prev, pid: data.pid }));
        }

        // Open new tab for first test
        if (data.testId) {
          window.open(`/tests/${data.testId}`, "_blank");
        }
      } else {
        alert("Failed to save bill.");
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-10">
        <h2 className="text-3xl font-bold text-center text-white bg-primary py-2 rounded">
          Patient Entry
        </h2>

        {/* Patient Search */}
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
                  key={p._id || p.uid}
                  onClick={() => handlePatientSelect(p)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.name} ({p.pid})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Patient Info Inputs */}
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
            name="phone"
            value={patientInfo.phone}
            onChange={handleInputChange}
            placeholder="Contact"
            className="input"
          />
          <div className="relative">
            <input
              type="text"
              name="refDoctor"
              value={patientInfo.refDoctor}
              onChange={handleRefDoctorChange}
              placeholder="Ref. Doctor"
              className="input"
              autoComplete="off"
            />
            {refDoctorSuggestions.length > 0 && (
              <ul className="absolute bg-white border rounded w-full mt-1 z-50 shadow max-h-48 overflow-y-auto">
                {refDoctorSuggestions.map((doc) => (
                  <li
                    key={doc._id || doc.id}
                    onClick={() => {
                      setPatientInfo((prev) => ({ ...prev, refDoctor: doc.name }));
                      setRefDoctorSuggestions([]);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                    <td className="p-2">{test.price.toFixed(2)}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        max={test.price}
                        value={discounts[test.test_id] || ""}
                        onChange={(e) =>
                          handleDiscountChange(test.test_id, e.target.value)
                        }
                        className="border rounded px-2 py-1 w-24"
                      />
                    </td>
                    <td className="p-2 font-semibold">
                      {(test.price - (discounts[test.test_id] || 0)).toFixed(2)}
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
            <p>Previous Due: {previousDue.toFixed(2)}</p>
            <p className="font-bold">Current Grand Total: {grandTotal.toFixed(2)}</p>
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
              localStorage.removeItem("selectedTests");
              setDiscounts({});
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
          >
            Clear
          </button>

          <button
            onClick={handleSaveAndPrint}
            className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
          >
            Save & Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;
