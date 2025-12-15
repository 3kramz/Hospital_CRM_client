import React from "react";

const InvoicePaymentSummary = ({ testTotal, discountTotal, previousDue, grandTotal, payment, due }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-8 mt-4 print:mt-1 print:gap-2">
      <div className="md:w-1/2 pt-4 print:pt-0">
         {/* Terms or Notes */}
         <h4 className="font-semibold text-gray-700 text-sm mb-2">Terms & Conditions</h4>
         <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
           Payment is due upon receipt. Reports will be delivered after full payment.
           Please keep this invoice for your records.
         </p>
      </div>

      <div className="md:w-1/2">
         <div className="bg-gray-50 rounded-lg p-5 space-y-3 print:p-3 print:space-y-1 print:bg-transparent print:border print:border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 print:text-xs">
               <span>Subtotal</span>
               <span className="font-medium text-gray-800">{testTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
               <span>Discount</span>
               <span className="font-medium text-red-500">-{discountTotal.toFixed(2)}</span>
            </div>
            {previousDue > 0 && (
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Previous Due</span>
                 <span className="font-medium text-amber-600">{previousDue.toFixed(2)}</span>
               </div>
            )}
            
            <div className="h-px bg-gray-200 my-2"></div>

            <div className="flex justify-between items-center">
               <span className="font-bold text-gray-800">Grand Total</span>
               <span className="font-bold text-xl text-blue-700">{grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 pt-1">
               <span>Paid Amount</span>
               <span className="font-medium text-green-600">-{payment}</span>
            </div>

             <div className="h-px bg-gray-200 my-2"></div>

            <div className="flex justify-between items-center pt-1">
               <span className="font-bold text-gray-800 text-lg">Balance Due</span>
               <span className={`font-bold text-xl ${due > 0 ? "text-red-600" : "text-green-600"}`}>
                 {Math.max(0, due).toFixed(2)}
               </span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InvoicePaymentSummary;
