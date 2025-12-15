import { FiPrinter } from "react-icons/fi";

const BillingSummary = ({
    total,
    totalDiscount,
    previousDue,
    finalTotal,
    payment,
    setPayment,
    updatedDue,
    handleSaveAndPrint,
    paymentRef
}) => {
    return (
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
                            value={payment === 0 ? "" : payment}
                            onChange={(e) => setPayment(parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveAndPrint();
                                }
                            }}
                            className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-600">Remaining Due</span>
                    <span className={`font-bold ${updatedDue > 0 ? "text-error" : "text-success"}`}>
                        {updatedDue.toFixed(2)}
                    </span>
                </div>

                <button
                    onClick={handleSaveAndPrint}
                    className="w-full mt-6 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-secondary/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                >
                    <FiPrinter className="text-lg" />
                    Save & Print Invoice
                </button>
                <div className="text-center">
                    <p className="text-xs text-gray-400 mt-2">
                        Press <kbd className="bg-gray-100 px-1 rounded border border-gray-200 font-sans">Ctrl</kbd> + <kbd className="bg-gray-100 px-1 rounded border border-gray-200 font-sans">Enter</kbd> to focus payment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BillingSummary;
