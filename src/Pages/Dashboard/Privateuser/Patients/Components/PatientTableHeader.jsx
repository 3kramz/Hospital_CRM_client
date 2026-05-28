import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const SortIcon = ({ field, sortField, sortOrder }) => {
    if (sortField !== field) return <FaSort className="opacity-30 text-[10px]" />;
    return sortOrder === "asc"
        ? <FaSortUp className="text-blue-500 text-[10px]" />
        : <FaSortDown className="text-blue-500 text-[10px]" />;
};

const SortableTh = ({ field, label, sortField, sortOrder, onSort, className = "" }) => (
    <th
        onClick={() => onSort(field)}
        className={`px-6 py-4 font-medium cursor-pointer select-none group transition-colors hover:bg-gray-100/80 ${sortField === field ? "text-blue-600 bg-gray-100/60" : "text-gray-500"} ${className}`}
    >
        <span className="inline-flex items-center gap-1.5">
            {label}
            <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
        </span>
    </th>
);

const PatientTableHeader = ({ sortField, sortOrder, onSort }) => {
    return (
        <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase tracking-wider border-b border-gray-100 shadow-sm">
            <tr>
                <SortableTh field="pid"       label="Patient ID"  sortField={sortField} sortOrder={sortOrder} onSort={onSort} />
                <SortableTh field="name"      label="Name"        sortField={sortField} sortOrder={sortOrder} onSort={onSort} />
                <th className="px-6 py-4 font-medium text-gray-500">Contact</th>
                <SortableTh field="age"       label="Age / Gender" sortField={sortField} sortOrder={sortOrder} onSort={onSort} className="text-right" />
                <SortableTh field="dueAmount" label="Total Due"   sortField={sortField} sortOrder={sortOrder} onSort={onSort} className="text-right" />
                <th className="px-6 py-4 font-medium text-gray-500 text-center">Action</th>
            </tr>
        </thead>
    );
};

export default PatientTableHeader;
