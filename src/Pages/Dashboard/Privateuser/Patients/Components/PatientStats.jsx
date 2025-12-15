import React from 'react';

const PatientStats = ({ patient }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Contact Info</p>
                <p className="font-bold text-gray-800">{patient.phone}</p>
                <p className="text-sm text-gray-600">{patient.email}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Age / Gender</p>
                <p className="font-bold text-gray-800">{patient.age} / {patient.gender}</p>
            </div>
            <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold">Address</p>
                <p className="font-medium text-gray-800">{patient.address || "N/A"}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Ref. Doctor</p>
                <p className="font-medium text-gray-800">{patient.refDoctor || "N/A"}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Current Due</p>
                <p className={`font-bold text-xl ${(patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                    ৳ {(patient.dueAmount || 0).toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default PatientStats;
