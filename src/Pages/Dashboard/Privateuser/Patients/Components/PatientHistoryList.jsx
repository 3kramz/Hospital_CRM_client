import React from 'react';
import { FiCalendar } from "react-icons/fi";

const PatientHistoryList = ({ history }) => {
    return (
        <div>
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FiCalendar /> Visit History
            </h3>

            <div className="space-y-6">
                {history.length === 0 ? (
                    <p className="text-center text-gray-400 italic">No history found.</p>
                ) : (
                    history.map((invoice) => (
                        <div key={invoice._id} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-200 last:before:bg-transparent">
                            <div className="absolute left-0 top-1 w-6 h-6 bg-secondary/20 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs text-secondary font-bold">
                            </div>
                            
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-500">Invoice #{invoice._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        (invoice.grandTotal - invoice.payment) <= 0 
                                        ? "bg-green-100 text-green-600" 
                                        : "bg-red-100 text-red-600"
                                    }`}>
                                        {(invoice.grandTotal - invoice.payment) <= 0 ? "PAID" : "DUE"}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    {invoice.tests.map((t, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{t.testName}</span>
                                            <span>৳ {t.price}</span>
                                        </div>
                                    ))}
                                    {invoice.tests.length === 0 && <span className="italic">Payment Only</span>}
                                </div>
                                
                                <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm font-bold">
                                    <span className="text-gray-500">Total: ৳ {invoice.grandTotal}</span>
                                    <span className="text-green-600">Paid: ৳ {invoice.payment}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientHistoryList;
