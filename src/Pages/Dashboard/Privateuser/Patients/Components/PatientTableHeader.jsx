const Th = ({ children, className = "" }) => (
    <th className={`px-6 py-4 font-medium ${className}`}>
        {children}
    </th>
);

const PatientTableHeader = () => {
    return (
        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 shadow-sm">
            <tr>
                <Th>Patient ID</Th>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th className="text-right">Age/Gender</Th>
                <Th className="text-right">Total Due</Th>
                <Th className="text-center">Action</Th>
            </tr>
        </thead>
    );
};

export default PatientTableHeader;
