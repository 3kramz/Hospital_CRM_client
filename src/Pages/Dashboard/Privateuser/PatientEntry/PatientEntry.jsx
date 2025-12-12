import { useEffect, useState, useCallback, useRef } from "react";
import { debounce } from "lodash";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import useTests from "../../../../Hook/useTests";
import { FiUser, FiCalendar, FiPhone, FiMapPin, FiMail, FiActivity, FiSearch, FiMonitor, FiPrinter, FiTrash2, FiPlusCircle, FiX } from "react-icons/fi";

const PatientEntry = () => {
  const axiosSecure = useAxiosSecure();
  const { testData, loading: testsLoading } = useTests();

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

  // Test Addition Search
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(-1);

  // Billing info
  const [previousDue, setPreviousDue] = useState(0);
  const [payment, setPayment] = useState(0);
  const [updatedDue, setUpdatedDue] = useState(0);

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

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
  const testSearchRef = useRef();

  // Helper to flatten test data
  const collectTests = useCallback((obj, parentKey = "") => {
    const collected = [];
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach((test) => collected.push({ ...test, dep: parentKey || key }));
      } else if (typeof value === "object" && value !== null) {
        collected.push(...collectTests(value, key));
      }
    }
    return collected;
  }, []);

  const allTests = useCallback(() => collectTests(testData), [testData, collectTests]);

  // Handle Test Search
  useEffect(() => {
    if (!testSearchQuery.trim()) {
      setTestSuggestions([]);
      setSelectedTestIndex(-1);
      return;
    }
    
    const query = testSearchQuery.toLowerCase();
    const flattened = allTests();
    const filtered = flattened
      .filter(t => t.name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 suggestions
    
    setTestSuggestions(filtered);
    setSelectedTestIndex(-1); // Reset selection on new search
  }, [testSearchQuery, allTests]);

  const saveToHistory = () => {
    setUndoStack(prev => [...prev, { tests, discounts }]);
    setRedoStack([]);
  };

  const addTest = (test) => {
    if (tests.some((t) => t.test_id === test.test_id)) {
      alert("Test already added.");
      return;
    }
    saveToHistory();
    setTests([...tests, test]);
    setDiscounts(prev => ({ ...prev, [test.test_id]: 0 }));
    setTestSearchQuery("");
    setTestSuggestions([]);
    setSelectedTestIndex(-1);
    // Keep focus on input for rapid entry
    testSearchRef.current?.focus();
  };
  
  const handleTestKeyDown = (e) => {
    // Ctrl + z (Undo)
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
       e.preventDefault();
       if (undoStack.length > 0) {
          const prevState = undoStack[undoStack.length - 1];
          setRedoStack(prev => [...prev, { tests, discounts }]);
          setTests(prevState.tests);
          setDiscounts(prevState.discounts);
          setUndoStack(prev => prev.slice(0, -1));
       }
       return;
    }

    // Ctrl + y (Redo)
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
       e.preventDefault();
       if (redoStack.length > 0) {
          const nextState = redoStack[redoStack.length - 1];
          setUndoStack(prev => [...prev, { tests, discounts }]);
          setTests(nextState.tests);
          setDiscounts(nextState.discounts);
          setRedoStack(prev => prev.slice(0, -1));
       }
       return;
    }

    // Ctrl + Backspace to remove last added test
    if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
      e.preventDefault();
      if (tests.length > 0) {
        const lastTest = tests[tests.length - 1];
        removeTest(lastTest.test_id);
      }
      return;
    }

    // Navigation inside suggestions
    if (testSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedTestIndex((prev) => 
          prev < testSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      } 
      
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedTestIndex((prev) => 
          prev > 0 ? prev - 1 : testSuggestions.length - 1
        );
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (testSuggestions.length > 0 && selectedTestIndex >= 0) {
        // Add selected suggestion
        addTest(testSuggestions[selectedTestIndex]);
      } else if (testSuggestions.length > 0 && selectedTestIndex === -1 && testSearchQuery.trim()) {
        // If there are suggestions but user didn't select one, add the first one
        addTest(testSuggestions[0]);
      } else if (!testSearchQuery.trim()) {
         // If search is empty and user hits enter, move to payment
         paymentRef.current?.focus();
      }
    }
  };

  const removeTest = (testId) => {
    saveToHistory();
    setTests(tests.filter(t => t.test_id !== testId));
    const newDiscounts = { ...discounts };
    delete newDiscounts[testId];
    setDiscounts(newDiscounts);
  };

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
        const invoiceId = billRes.groupId || billRes.insertedId || billRes._id;
        if (invoiceId) {
          const url = `${window.location.origin}/invoice/${invoiceId}`;
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
            console.warn("Bill saved, but no ID returned to open invoice.", billRes);
            alert("Bill saved, but could not open invoice automatically.");
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

  const inputStyle = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all";
  const iconStyle = "absolute left-3 top-3.5 text-gray-400 text-lg";

  // Ref to hold the latest version of the save function to avoid effect re-binding
  const saveFunctionRef = useRef(handleSaveAndPrint);
  useEffect(() => {
    saveFunctionRef.current = handleSaveAndPrint;
  });

  // Global Ctrl+Enter shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        paymentRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Reception Entry</h1>
            <p className="text-gray-500 text-sm">Register patient and generate invoice</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded-full"></span>
              Patient Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Name (with search) */}
               <div className="relative col-span-1 md:col-span-2">
                <FiSearch className={iconStyle} />
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
                    className={inputStyle}
                    autoComplete="off"
                  />
                  {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-100 rounded-xl w-full mt-2 z-50 shadow-xl max-h-60 overflow-y-auto overflow-hidden">
                      {suggestions.map((p, idx) => (
                        <li
                          key={p._id || p.uid}
                          onClick={() => handlePatientSelect(p)}
                          className={`px-4 py-3 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0 ${
                            idx === selectedSuggestionIndex
                              ? "bg-secondary/10 text-secondary font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {p.name} <span className="text-xs text-gray-400 ml-1">({p.pid})</span>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>

               {/* Age */}
               <div className="relative">
                  <FiCalendar className={iconStyle} />
                  <input
                    ref={ageRef}
                    type="number"
                    name="age"
                    value={patientInfo.age}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, genderRef)}
                    placeholder="Age *"
                    className={inputStyle}
                  />
               </div>

               {/* Gender */}
               <div className="relative">
                  <FiUser className={iconStyle} />
                  <select
                    ref={genderRef}
                    name="gender"
                    value={patientInfo.gender}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, phoneRef)}
                    className={`${inputStyle} appearance-none`}
                  >
                    <option value="">Select Gender *</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
               </div>
               
               {/* Phone */}
               <div className="relative">
                  <FiPhone className={iconStyle} />
                  <input
                    ref={phoneRef}
                    type="text"
                    name="phone"
                    value={patientInfo.phone}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, addressRef)}
                    placeholder="Contact Number *"
                    className={inputStyle}
                  />
               </div>

               {/* Address */}
               <div className="relative">
                  <FiMapPin className={iconStyle} />
                   <input
                    ref={addressRef}
                    type="text"
                    name="address"
                    value={patientInfo.address}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, emailRef)}
                    placeholder="Address *"
                    className={inputStyle}
                  />
               </div>

                {/* Email */}
                <div className="relative">
                  <FiMail className={iconStyle} />
                   <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={patientInfo.email}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, refDoctorRef)}
                    placeholder="Email Address"
                    className={inputStyle}
                  />
               </div>

               {/* Ref Doctor */}
               <div className="relative">
                 <FiActivity className={iconStyle} />
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
                    className={inputStyle}
                    autoComplete="off"
                  />
                   {refDoctorSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-100 rounded-xl w-full mt-2 z-50 shadow-xl max-h-48 overflow-y-auto">
                      {refDoctorSuggestions.map((doc) => (
                        <li
                          key={doc._id || doc.id}
                          onClick={() => handleRefDoctorSelect(doc)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                        >
                          {doc.name}
                        </li>
                      ))}
                    </ul>
                  )}
               </div>

               {/* PC Name */}
               <div className="relative">
                 <FiMonitor className={iconStyle} />
                 <input
                    ref={pcNameRef}
                    type="text"
                    name="pcName"
                    value={patientInfo.pcName}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterFocus(e, testSearchRef)}
                    placeholder="PC Name"
                    className={inputStyle}
                  />
               </div>
            </div>
          </div>
          
          {/* Detailed Invoice Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible z-10">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-2xl">
                <h3 className="font-semibold text-gray-700">Test Details</h3>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase">
                   {tests.length} Items
                </span>
             </div>
             
             <div className="">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-3 font-medium">Test Name</th>
                      <th className="px-6 py-3 font-medium text-right">Price</th>
                      <th className="px-6 py-3 font-medium text-center">Discount</th>
                      <th className="px-6 py-3 font-medium text-right">Net</th>
                      <th className="px-4 py-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                   <tbody className="divide-y divide-gray-100">
                    {tests.length === 0 ? (
                       <tr>
                         <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                            No tests selected. Use the search below to add tests.
                         </td>
                       </tr>
                    ) : (
                      tests.map((test) => (
                        <tr key={test.test_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{test.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-right">{test.price.toFixed(2)}</td>
                          <td className="px-6 py-2 text-center">
                            <input
                                type="number"
                                min={0}
                                max={test.price}
                                value={discounts[test.test_id] || ""}
                                onChange={(e) =>
                                  handleDiscountChange(test.test_id, e.target.value)
                                }
                                placeholder="0"
                                className="w-20 text-center border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-secondary transition-colors"
                              />
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                             {(test.price - (discounts[test.test_id] || 0)).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center">
                             <button 
                               onClick={() => removeTest(test.test_id)}
                               className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-2 rounded-lg"
                             >
                                <FiX />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                   </tbody>
                </table>
             </div>
             
             {/* Add Test Section */}
             <div className="p-4 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                <div className="relative">
                   <FiPlusCircle className="absolute left-3 top-3.5 text-secondary text-lg" />
                   <input
                      ref={testSearchRef}
                      type="text"
                      placeholder="Search to add tests..."
                      value={testSearchQuery}
                      onChange={(e) => setTestSearchQuery(e.target.value)}
                      onKeyDown={handleTestKeyDown}
                      autoComplete="off"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-sm"
                   />
                   {testSuggestions.length > 0 && (
                      <ul className="absolute bottom-full mb-2 bg-white border border-gray-100 rounded-xl w-full z-50 shadow-xl max-h-60 overflow-y-auto">
                         {testSuggestions.map((test, idx) => {
                            const isAdded = tests.some(t => t.test_id === test.test_id);
                            return (
                               <li
                                 key={test.test_id}
                                 onClick={() => !isAdded && addTest(test)}
                                 className={`px-4 py-3 flex justify-between items-center cursor-pointer border-b border-gray-50 last:border-0 transition-colors
                                   ${isAdded ? "bg-gray-50 opacity-50 cursor-not-allowed" : ""}
                                   ${idx === selectedTestIndex ? "bg-secondary/10 text-secondary font-medium" : "hover:bg-secondary/5 hover:text-secondary"}
                                 `}
                               >
                                  <span className="font-medium text-sm">{test.name}</span>
                                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">৳ {test.price}</span>
                               </li>
                            );
                         })}
                      </ul>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Billing Summary */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Payment Summary</h2>
              
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{total.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600">
                    <span>Discount</span>
                    <span className="font-medium text-error">- {totalDiscount.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600">
                    <span>Previous Due</span>
                    <span className="font-medium text-warning">{previousDue.toFixed(2)}</span>
                 </div>
                 
                 <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                       <span className="text-base font-bold text-gray-800">Grand Total</span>
                       <span className="text-xl font-bold text-primary">{finalTotal.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="bg-gray-50 rounded-xl p-4 mt-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cash Received</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">৳</span>
                        <input
                          ref={paymentRef}
                          type="number"
                          min="0"
                          value={payment}
                          onChange={(e) => setPayment(parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => {
                             if(e.key === 'Enter') {
                                handleSaveAndPrint();
                             }
                          }}
                          className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success font-bold text-lg text-gray-800"
                        />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2">
                     <span className="font-medium text-gray-600">Net Due</span>
                     <span className={`font-bold text-lg ${updatedDue > 0 ? "text-red-500" : "text-green-500"}`}>
                        {updatedDue.toFixed(2)}
                     </span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button
                    onClick={() => {
                      if(window.confirm("Are you sure you want to clear all data?")) {
                          setTests([]);
                          localStorage.removeItem("selectedTests");
                          setDiscounts({});
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-medium"
                 >
                    <FiTrash2 /> Clear
                 </button>
                 <button
                    onClick={handleSaveAndPrint}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all font-bold"
                 >
                    <FiPrinter /> Save & Print
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;
