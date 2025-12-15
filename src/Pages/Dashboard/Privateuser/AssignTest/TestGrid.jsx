import React from "react";
import { IoSearchOutline, IoFlaskOutline } from "react-icons/io5";

const TestGrid = ({ tests, selectedTests, onAddTest }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
      {tests.length > 0 ? (
        tests.map((test) => {
          const isSelected = selectedTests.some((t) => t.test_id === test.test_id);
          return (
            <div
              key={test.test_id}
              onClick={() => !isSelected && onAddTest(test)}
              className={`
                      relative group p-4 rounded-xl border transition-all duration-200 cursor-pointer
                      ${
                        isSelected
                          ? "bg-secondary/5 border-secondary ring-1 ring-secondary"
                          : "bg-white border-gray-100 hover:shadow-md hover:border-secondary/50"
                      }
                    `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      isSelected
                        ? "text-secondary"
                        : "text-gray-700 group-hover:text-primary"
                    }`}
                  >
                    {test.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                    {test.dep || "General"}
                  </p>
                </div>
                <div
                  className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-secondary text-white"
                            : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                        }
                      `}
                >
                  <IoFlaskOutline />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-gray-900">৳ {test.price}</span>
                {isSelected && (
                  <span className="text-xs font-bold text-secondary uppercase">
                    Selected
                  </span>
                )}
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
  );
};

export default TestGrid;
