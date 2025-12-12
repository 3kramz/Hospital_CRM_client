import { useState } from "react";
import useTests from "../../../../Hook/useTests";
import AlphabetFilter from "./AlphabetFilter";
import { IoCloseOutline, IoSearchOutline, IoFlaskOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const AssignTest = () => {
  const { testData, loading } = useTests();
  const [search, setSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (!testData || typeof testData !== "object")
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-error">
        <p className="text-lg font-semibold">Error loading test data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-outline btn-error btn-sm"
        >
          Retry
        </button>
      </div>
    );

  const addTest = (test) => {
    if (!selectedTests.some((t) => t.test_id === test.test_id)) {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const removeTest = (testId) => {
    setSelectedTests(selectedTests.filter((t) => t.test_id !== testId));
  };

  const getFilteredTests = (tests) => {
    return tests
      .filter(
        (test) =>
          (!search || test.name.toLowerCase().includes(search.toLowerCase())) &&
          (!selectedLetter || test.name.toUpperCase().startsWith(selectedLetter))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const collectTests = (obj, parentKey = "") => {
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
  };

  const departments = Object.keys(testData);
  const allTests = collectTests(testData);

  const testsToShow =
    activeTab === "all"
      ? getFilteredTests(allTests)
      : getFilteredTests(collectTests(testData[activeTab]));

  const handleNext = () => {
    if (selectedTests.length === 0) {
      // Using a toast or simple alert for now
      alert("Please select at least one test.");
      return;
    }
    localStorage.setItem("selectedTests", JSON.stringify(selectedTests));
    setSelectedTests([]);
    navigate("/dashboard/patient-entry");
  };

  const totalAmount = selectedTests.reduce((acc, test) => acc + test.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-[calc(100vh-80px)] bg-gray-50/50 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assign Tests</h1>
        <p className="text-gray-500 mt-1 text-sm">Select tests to assign to the patient.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Tests Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls: Search & Tabs */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IoSearchOutline className="text-xl" />
              </div>
              <input
                type="text"
                placeholder="Search by test name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>

            {/* Department Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedLetter(null);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Tests
              </button>
              {departments.map((dep) => (
                <button
                  key={dep}
                  onClick={() => {
                    setActiveTab(dep);
                    setSelectedLetter(null);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium uppercase transition-all ${
                    activeTab === dep
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {dep.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            
             {/* Alphabet Filter */}
             <div className="mt-4 border-t border-gray-100 pt-4">
               <AlphabetFilter
                  selectedLetter={selectedLetter}
                  onSelectLetter={setSelectedLetter}
                />
             </div>
          </div>

          {/* Test Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
            {testsToShow.length > 0 ? (
              testsToShow.map((test) => {
                const isSelected = selectedTests.some(t => t.test_id === test.test_id);
                return (
                  <div
                    key={test.test_id}
                    onClick={() => !isSelected && addTest(test)}
                    className={`
                      relative group p-4 rounded-xl border transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? "bg-secondary/5 border-secondary ring-1 ring-secondary" 
                        : "bg-white border-gray-100 hover:shadow-md hover:border-secondary/50"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isSelected ? "text-secondary" : "text-gray-700 group-hover:text-primary"}`}>
                          {test.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                          {test.dep || "General"}
                        </p>
                      </div>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${isSelected ? "bg-secondary text-white" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"}
                      `}>
                         <IoFlaskOutline />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                       <span className="font-bold text-gray-900">৳ {test.price}</span>
                       {isSelected && <span className="text-xs font-bold text-secondary uppercase">Selected</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                    <IoSearchOutline />
                 </div>
                 <p>No tests found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Selected Tests (Cart) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-40px)]">
            <div className="p-5 bg-primary text-white flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2">
                Selected Tests
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {selectedTests.length}
                </span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {selectedTests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10">
                   <IoFlaskOutline className="text-4xl opacity-50"/>
                   <p className="text-sm">No tests selected yet</p>
                </div>
              ) : (
                selectedTests.map((test) => (
                  <div
                    key={test.test_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="font-medium text-gray-800 text-sm truncate" title={test.name}>
                        {test.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">৳ {test.price}</p>
                    </div>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         removeTest(test.test_id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors"
                    >
                      <IoCloseOutline className="text-lg" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total Footer */}
            <div className="p-5 bg-gray-50 border-t border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">৳ {totalAmount}</span>
               </div>
               
               <button
                onClick={handleNext}
                disabled={selectedTests.length === 0}
                className={`
                  w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all transform active:scale-95
                  ${selectedTests.length > 0
                    ? "bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/30" 
                    : "bg-gray-300 cursor-not-allowed"
                  }
                `}
              >
                Proceed to Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default AssignTest;
