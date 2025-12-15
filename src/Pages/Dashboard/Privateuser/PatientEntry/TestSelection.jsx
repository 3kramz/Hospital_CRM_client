import React from 'react';
import { FiX, FiPlusCircle } from "react-icons/fi";

const TestSelection = ({
    tests,
    discounts,
    handleDiscountChange,
    removeTest,
    testSearchQuery,
    setTestSearchQuery,
    testSuggestions,
    selectedTestIndex,
    handleTestKeyDown,
    addTest,
    testSearchRef
}) => {
    return (
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
    );
};

export default TestSelection;
