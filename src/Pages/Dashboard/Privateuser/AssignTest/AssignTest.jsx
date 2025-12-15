import { useState } from "react";
import useTests from "../../../../Hook/useTests";
import { useNavigate } from "react-router-dom";
import TestFilters from "./TestFilters";
import TestGrid from "./TestGrid";
import SelectedTestsCart from "./SelectedTestsCart";

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
          (!selectedLetter ||
            test.name.toUpperCase().startsWith(selectedLetter))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const collectTests = (obj, parentKey = "") => {
    const collected = [];
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach((test) =>
          collected.push({ ...test, dep: parentKey || key })
        );
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
        <p className="text-gray-500 mt-1 text-sm">
          Select tests to assign to the patient.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Tests Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls: Search & Tabs */}
          <TestFilters
            search={search}
            setSearch={setSearch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            departments={departments}
            selectedLetter={selectedLetter}
            setSelectedLetter={setSelectedLetter}
          />

          {/* Test Grid */}
          <TestGrid
            tests={testsToShow}
            selectedTests={selectedTests}
            onAddTest={addTest}
          />
        </div>

        {/* Right Panel: Selected Tests (Cart) */}
        <SelectedTestsCart
          selectedTests={selectedTests}
          onRemoveTest={removeTest}
          onProceed={handleNext}
          totalAmount={totalAmount}
        />
      </div>
    </div>
  );
};

export default AssignTest;

