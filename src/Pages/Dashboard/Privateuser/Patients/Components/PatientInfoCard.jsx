const PatientInfoCard = ({ patient }) => {
    return (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10 flex flex-wrap gap-8 justify-between">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Full Name</p>
                    <p className="text-lg font-bold text-gray-800">{patient.name}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Contact</p>
                    <p className="text-gray-700">{patient.phone}</p>
                    {patient.email && <p className="text-xs text-gray-500">{patient.email}</p>}
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Age / Gender</p>
                    <p className="text-gray-700">{patient.age} / {patient.gender}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Address</p>
                    <p className="text-gray-700">{patient.address || "N/A"}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ref. Doctor</p>
                    <p className="text-gray-700">{patient.refDoctor || "N/A"}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Due</p>
                <p className={`text-2xl font-bold ${(patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                    ৳ {(patient.dueAmount || 0).toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default PatientInfoCard;
