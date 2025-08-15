import { useEffect, useState, useCallback, useRef } from "react";
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
    address: "",
    email: "",
    refDoctor: "",
    pcName: "",
    pid: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  // Refs for Enter key navigation
  const nameRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();
  const phoneRef = useRef();
  const addressRef = useRef();
  const emailRef = useRef();
  const refDoctorRef = useRef();
  const pcNameRef = useRef();
  const paymentRef = useRef();

  // === Patient Search (debounced) ===
  const searchPatients = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setPreviousDue(0);
        return;
      }
      try {
        const { data } = await axiosSecure.get(`/patients/search?q=${query}`);
        setSuggestions(data);
        console.log(data);
        setSelectedSuggestionIndex(-1);
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      setSearchQuery(value);
      searchPatients(value);
    }

    if (name === "refDoctor") {
      setRefDoctorQuery(value);
      searchRefDoctors(value);
    }

    // If user clears patient name, clear other fields
    if (name === "name" && value === "") {
      setPatientInfo({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        email: "",
        refDoctor: "",
        pcName: "",
        pid: "",
      });
      setPreviousDue(0);
    }
  };

  const handlePatientSelect = (patient) => {
    setPatientInfo({
      name: patient.name,
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      email: patient.email || "",
      refDoctor: patient.refDoctor || "",
      pcName: patient.pcName || "",
      pid: patient.pid || "",
    });
    setPreviousDue(patient.dueAmount || 0);
    setSearchQuery(`${patient.name} (${patient.pid})`);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        handlePatientSelect(suggestions[selectedSuggestionIndex]);
      } else {
        ageRef.current.focus();
      }
    }
  };

  const handleRefDoctorSelect = (doctor) => {
    setPatientInfo((prev) => ({ ...prev, refDoctor: doctor.name }));
    setRefDoctorSuggestions([]);
  };

  const handleDiscountChange = (testId, val) => {
    setDiscounts((prev) => ({
      ...prev,
      [testId]: parseFloat(val) || 0,
    }));
  };

  // Load tests from localStorage on mount
  useEffect(() => {
    const storedTests = JSON.parse(localStorage.getItem("selectedTests")) || [];
    setTests(storedTests);
    const initialDiscounts = {};
    storedTests.forEach((test) => {
      initialDiscounts[test.test_id] = 0;
    });
    setDiscounts(initialDiscounts);
  }, []);

  // Billing calculations
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

  // Enter key navigation between inputs
  const handleEnterFocus = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleSaveAndPrint = async () => {
    const { name, age, gender, phone, address } = patientInfo;

    if (!name || !age || !gender || !phone || !address) {
      alert("Please fill in all required patient fields.");
      return;
    }

    if (tests.length === 0) {
      alert("Please select at least one test.");
      return;
    }

    try {
      // Step 1: Save patient
      const { data: patientRes } = await axiosSecure.post("/patients/save", {
        patientInfo,
      });
      console.log(patientInfo)
      if (!patientRes.success) {
        alert("Failed to save patient: " + patientRes.error);
        return;
      }

      const pid = patientRes.pid;
      const previousDueFromBackend = patientRes.previousDue || 0;

      // Update local state for correct due
      setPatientInfo((prev) => ({ ...prev, pid }));
      setPreviousDue(previousDueFromBackend);

      // Step 2: Save bill
      const billData = {
        patientInfo: { ...patientInfo, pid },
        tests,
        discounts,
        payment,
        updatedDue,
        grandTotal: finalTotal,
      };

      const { data: billRes } = await axiosSecure.post(
        "/save-patient-bill",
        billData
      );

      if (billRes.success) {
        alert("Bill saved successfully.");
        if (billRes.groupId) {
          const url = `${window.location.origin}/invoice/${billRes.groupId}`;
          window.open(url, "_blank", "noopener,noreferrer");
        }

        // Reset form
        setPatientInfo({
          name: "",
          age: "",
          gender: "",
          phone: "",
          address: "",
          email: "",
          refDoctor: "",
          pcName: "",
          pid: "",
        });
        setTests([]);
        setDiscounts({});
        localStorage.removeItem("selectedTests");
        setPayment(0);
        setPreviousDue(0);
        setUpdatedDue(0);
      } else {
        alert("Failed to save bill: " + billRes.error);
      }
    } catch (err) {
      console.error("Error saving bill:", err);
      alert("Error saving bill. See console.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-10">
        <h2 className="text-3xl font-bold text-center text-white bg-primary py-2 rounded">
          Patient Entry
        </h2>

        {/* Patient Info Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative">
          <div className="relative">
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={patientInfo.name}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                handleSuggestionKeyDown(e);
                handleEnterFocus(e, ageRef);
              }}
              placeholder="Patient Name *"
              className="input"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border rounded w-full mt-1 z-50 shadow max-h-60 overflow-y-auto">
                {suggestions.map((p, idx) => (
                  <li
                    key={p._id || p.uid}
                    onClick={() => handlePatientSelect(p)}
                    className={`px-4 py-2 cursor-pointer ${
                      idx === selectedSuggestionIndex
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {p.name} ({p.pid})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            ref={ageRef}
            type="number"
            name="age"
            value={patientInfo.age}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, genderRef)}
            placeholder="Age *"
            className="input"
          />

          <select
            ref={genderRef}
            name="gender"
            value={patientInfo.gender}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, phoneRef)}
            className="input"
          >
            <option value="">Gender *</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <input
            ref={phoneRef}
            type="text"
            name="phone"
            value={patientInfo.phone}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, addressRef)}
            placeholder="Contact *"
            className="input"
          />

          <input
            ref={addressRef}
            type="text"
            name="address"
            value={patientInfo.address}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, emailRef)}
            placeholder="Address *"
            className="input"
          />

          <input
            ref={emailRef}
            type="email"
            name="email"
            value={patientInfo.email}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, refDoctorRef)}
            placeholder="Email"
            className="input"
          />

          <div className="relative">
            <input
              ref={refDoctorRef}
              type="text"
              name="refDoctor"
              value={patientInfo.refDoctor}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                handleSuggestionKeyDown(e);
                handleEnterFocus(e, ageRef);
              }}
              placeholder="Ref. Doctor"
              className="input"
              autoComplete="off"
            />
            {refDoctorSuggestions.length > 0 && (
              <ul className="absolute bg-white border rounded w-full mt-1 z-50 shadow max-h-48 overflow-y-auto">
                {refDoctorSuggestions.map((doc) => (
                  <li
                    key={doc._id || doc.id}
                    onClick={() => handleRefDoctorSelect(doc)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            ref={pcNameRef}
            type="text"
            name="pcName"
            value={patientInfo.pcName}
            onChange={handleInputChange}
            onKeyDown={(e) => handleEnterFocus(e, paymentRef)}
            placeholder="PC Name"
            className="input"
          />
        </div>

        {/* Billing Table */}
        <div>
          <h3 className="text-xl font-semibold text-center text-white bg-primary py-2 rounded">
            Diagnostics and Billing
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
            <p className="font-bold">
              Current Grand Total: {grandTotal.toFixed(2)}
            </p>
            <p className="text-blue-700 font-semibold">
              Final Total (incl. Due): {finalTotal.toFixed(2)}
            </p>

            <div className="flex justify-end items-center gap-2">
              <label>Payment:</label>
              <input
                ref={paymentRef}
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
