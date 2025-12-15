import React from "react";

const Td = ({ children, className = "" }) => (
  <td className={`py-3 px-4 print:py-0.5 print:px-2 ${className}`}>
    {children}
  </td>
);

const Th = ({ children, className = "" }) => (
  <th className={`py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider print:py-1 print:px-2 ${className}`}>
    {children}
  </th>
);

const InvoiceItemsTable = ({ tests }) => {
  return (
    <div className="mb-8 print:mb-4">
      <table className="w-full text-sm print:text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
            <Th className="text-left rounded-tl-lg">#</Th>
            <Th className="text-left w-1/2">Test Name</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Disc.</Th>
            <Th className="text-right rounded-tr-lg">Amount</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tests.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              <Td className="text-gray-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</Td>
              <Td className="text-gray-800 font-medium">{t.testName}</Td>
              <Td className="text-gray-600 text-right">{t.price.toFixed(2)}</Td>
              <Td className="text-gray-500 text-right">{t.discount > 0 ? `-${t.discount}` : '-'}</Td>
              <Td className="text-gray-800 font-medium text-right font-mono">
                {(t.price - (t.discount || 0)).toFixed(2)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      {tests.length === 0 && (
         <div className="p-4 text-center text-gray-400 italic bg-gray-50 print:p-2">No tests added.</div>
      )}
    </div>
  );
};

export default InvoiceItemsTable;
