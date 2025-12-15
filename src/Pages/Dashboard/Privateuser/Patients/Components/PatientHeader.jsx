import React from 'react';
import { FiUser, FiX } from "react-icons/fi";

const PatientHeader = ({ patient, onClose }) => {
    return (
        <div className="bg-primary p-8 text-white text-center relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                title="Close"
            >
                <FiX className="text-xl" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <FiUser />
            </div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="opacity-90 mt-1">{patient.pid}</p>
        </div>
    );
};

export default PatientHeader;
