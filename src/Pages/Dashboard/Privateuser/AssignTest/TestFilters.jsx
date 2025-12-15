import { IoSearchOutline } from "react-icons/io5";
import AlphabetFilter from "./AlphabetFilter";

const TestFilters = ({
  search,
  setSearch,
  activeTab,
  setActiveTab,
  departments,
  selectedLetter,
  setSelectedLetter,
}) => {
  return (
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
  );
};

export default TestFilters;
