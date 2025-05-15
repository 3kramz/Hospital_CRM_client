import { useState } from "react";
import useTests from "../../../../Hook/useTests";
import AlphabetFilter from "./AlphabetFilter";
import { IoCloseCircleOutline } from "react-icons/io5";

const AssignTest = () => {
  const { testData, loading } = useTests();
  const [search, setSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState(null);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!testData || typeof testData !== "object")
    return (
      <div className="text-center text-red-500 p-4">
        Error loading test data
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

  const departments = Object.keys(testData);

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

  const allTests = collectTests(testData);

  let testsToShow = [];
  if (activeTab === "all") {
    testsToShow = getFilteredTests(allTests);
  } else {
    const departmentData = testData[activeTab];
    let deptTests = [];

    if (Array.isArray(departmentData)) {
      deptTests = departmentData.map((test) => ({ ...test, dep: activeTab }));
    } else if (typeof departmentData === "object" && departmentData !== null) {
      deptTests = collectTests(departmentData);
    }

    testsToShow = getFilteredTests(deptTests);
  }

  return (
    <div className="flex gap-5 p-4">
      {/* Left Panel */}
      <div className="flex-1">
        {/* Sticky Top */}
        <div className="sticky top-0 bg-white z-10 py-3">
          {/* Department Tabs */}
          <div className="flex flex-wrap bg-secondary text-primary text-2xl gap-2 mb-3 w-full h-16 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab("all");
                setSelectedLetter(null);
              }}
              className={`px-3 py-1 flex-1 h-full ${
                activeTab === "all"
                  ? "font-bold bg-primary rounded-l-2xl text-white"
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
                className={`px-3 py-1 flex-1 h-full ${
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
        <div className="max-h-[70vh] overflow-y-auto mt-6 pr-2">
          <div className="flex flex-wrap gap-2 ">
            {testsToShow.length > 0 ? (
              testsToShow.map((test) => (
                <div
                  key={test.test_id}
                  onClick={() => addTest(test)}
                  className="cursor-pointer flex items-center hover:text-secondary transition duration-200"
                >
                  <strong className="">
                    {test.name}
                    <span className="font-bold m-3 text-primary">|</span>
                  </strong>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No tests available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <aside className="w-1/3 sticky top-0 h-screen overflow-y-auto bg-gray-50 p-4 border-l border-gray-300">
        <div className="flex items-center justify-between mb-4 bg-info text-primary p-3 rounded">
          <h3 className="text-lg font-semibold">Selected Tests</h3>
          <h3 className="text-lg font-semibold">Amount</h3>
        </div>
        {selectedTests.length === 0 ? (
          <p className="text-gray-500">No tests selected</p>
        ) : (
          <ul className="space-y-2">
            {selectedTests.map((test) => (
              <li
                key={test.test_id}
                className="flex justify-start items-center border-b pb-1"
              >
                <button
                  onClick={() => removeTest(test.test_id)}
                  className="ml-2 px-5 py-1  rounded hover:text-red-600"
                >
                  <IoCloseCircleOutline />
                </button>
                <span title={test.name}>
                  {test.name.length > 25
                    ? test.name.slice(0, 25) + "..."
                    : test.name}
                </span>
                <div className="flex-1 text-right">

                <span className="">{test.price}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {selectedTests.length > 0 && (
          <div className=" flex justify-between mt-4">
            <h3 className="text-lg font-semibold">Total Amount</h3>
            <p className="text-xl font-bold">
             = {selectedTests.reduce((acc, test) => acc + test.price, 0)}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default AssignTest;
