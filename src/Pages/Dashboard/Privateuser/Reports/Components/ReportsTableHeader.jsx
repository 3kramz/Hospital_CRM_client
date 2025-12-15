const ReportsTableHeader = ({ handleSort, sortField, sortOrder }) => {
    return (
        <thead className="bg-gray-50/50">
            <tr>
               {[
                 { label: "#", field: "serial", align: "center" },
                 { label: "Invoice ID", field: "invoiceId", align: "left" },
                 { label: "Patient", field: "patientName", align: "left" },
                 { label: "Payment", field: "status", align: "center" },
                 { label: "Test Status", field: "testStatus", align: "center" },
                 { label: "Date", field: "createdAt", align: "center" },
                 { label: "Action", field: "", align: "center" },
               ].map(({ label, field, align }) => (
                 <th
                   key={label}
                   scope="col"
                   className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-${align} cursor-pointer hover:text-gray-700 select-none`}
                   onClick={() => field && handleSort(field)}
                 >
                   <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'} gap-1`}>
                     {label}
                     {sortField === field && (
                       <span className="text-blue-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                     )}
                   </div>
                 </th>
               ))}
            </tr>
        </thead>
    );
};

export default ReportsTableHeader;
