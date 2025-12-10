import { useState } from "react";
import useTests from "../../../../Hook/useTests";
import AlphabetFilter from "./AlphabetFilter";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const AssignTest = () => {
  const { testData, loading } = useTests();
  const [search, setSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const navigate = useNavigate();

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!testData || typeof testData !== "object")
    return <div className="text-center text-red-500 p-4">Error loading test data</div>;

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
      alert("Please select at least one test.");
      return;
    }
    localStorage.setItem("selectedTests", JSON.stringify(selectedTests));
    setSelectedTests([]);
    navigate("/dashboard/patient-entry");
  };

  return (
    <div className="p-4 pt-6 md:pt-10 overflow-auto max-h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Panel */}
        <div className="w-full md:w-2/3 flex flex-col">
          {/* Sticky Top Section */}
          <div className="bg-white z-10 py-3 sticky top-0">
            {/* Department Tabs */}
            <div className="flex flex-wrap uppercase bg-secondary text-primary text-sm sm:text-base md:text-lg gap-2 mb-3 w-full h-auto rounded-2xl">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setSelectedLetter(null);
                }}
                className={`px-3 py-2 flex-1 uppercase ${
                  activeTab === "all"
                    ? "font-bold bg-primary text-white rounded-l-2xl"
                    : ""
                }`}
              >
                All Tests
              </button>
              {departments.map((dep, index) => (
                <button
                  key={dep}
                  onClick={() => {
                    setActiveTab(dep);
                    setSelectedLetter(null);
                  }}
                  className={`px-3 py-2 flex-1 uppercase ${
                    activeTab === dep
                      ? "font-bold bg-primary text-white"
                      : "border-gray-300"
                  } ${index === departments.length - 1 ? "rounded-r-2xl" : ""}`}
                >
                  {dep.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Alphabet Filter */}
            <AlphabetFilter
              selectedLetter={selectedLetter}
              onSelectLetter={setSelectedLetter}
            />

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-info rounded w-full h-12 mt-4 px-3 py-2 focus:outline-none focus:ring focus:ring-secondary"
            />
          </div>

          {/* Test List */}
          <div className="overflow-y-auto mt-6 pr-2 max-h-[60vh] md:max-h-[70vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {testsToShow.length > 0 ? (
                testsToShow.map((test) => (
                  <div
                    key={test.test_id}
                    onClick={() => addTest(test)}
                    className="cursor-pointer text-sm border rounded px-2 py-1 flex items-center hover:text-secondary transition"
                  >
                    <strong>
                      {test.name.length > 15
                        ? test.name.slice(0, 15) + "..."
                        : test.name}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No tests available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel (Selected Tests) */}
        <aside className="w-full md:w-1/3 max-h-[85vh] bg-gray-50 p-4 border border-gray-300 rounded flex flex-col sticky md:top-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 bg-info text-primary p-3 rounded">
            <h3 className="text-lg font-semibold">Selected Tests</h3>
            <h3 className="text-lg font-semibold">Amount</h3>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedTests.length === 0 ? (
              <p className="text-gray-500">No tests selected</p>
            ) : (
              <ul className="space-y-2">
                {selectedTests.map((test) => (
                  <li
                    key={test.test_id}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => removeTest(test.test_id)}
                        className="text-red-500 hover:text-red-700 mr-2"
                      >
                        <IoCloseCircleOutline />
                      </button>
                      <span className="truncate max-w-[140px]" title={test.name}>
                        {test.name.length > 15
                          ? test.name.slice(0, 15) + "..."
                          : test.name}
                      </span>
                    </div>
                    <span>{test.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Total & Next */}
          <div className="mt-4">
            {selectedTests.length > 0 && (
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Amount</h3>
                <p className="text-xl font-bold text-error">
                  {selectedTests.reduce((acc, test) => acc + test.price, 0)}
                </p>
              </div>
            )}
            <button
              className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssignTest;

