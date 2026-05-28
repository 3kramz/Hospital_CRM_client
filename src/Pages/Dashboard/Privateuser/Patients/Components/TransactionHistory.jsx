import { FiCalendar, FiPrinter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const TransactionHistory = ({ history }) => {
    const navigate = useNavigate();
    if (history.length === 0) {
        return (
            <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-xl italic">
                No transaction history found.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((invoice) => (
                <div key={invoice._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FiCalendar />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">
                                    {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(invoice.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => navigate(`/invoice/${invoice._id}`)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FiPrinter /> Invoice
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg text-sm">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tests</p>
                            {invoice.tests && invoice.tests.length > 0 ? (
                                <ul className="space-y-1">
                                    {invoice.tests.map((t, idx) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{t.testName}</span>
                                            <span className="font-medium text-gray-600">৳ {t.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-gray-400 italic">No tests (Payment Only)</span>
                            )}
                        </div>
                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Amt.</span>
                                <span className="font-medium">৳ {invoice.grandTotal || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid</span>
                                <span className="font-bold text-green-600">৳ {invoice.payment || 0}</span>
                            </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                <span className="text-gray-500 font-bold">Balance</span>
                                <span className={`font-bold ${(invoice.grandTotal - invoice.payment) > 0 ? "text-red-500" : "text-gray-600"}`}>
                                    ৳ {(invoice.grandTotal - invoice.payment).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionHistory;
