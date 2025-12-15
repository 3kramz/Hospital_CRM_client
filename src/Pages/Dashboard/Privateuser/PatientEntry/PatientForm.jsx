import React from 'react';
import { FiUser, FiCalendar, FiPhone, FiMapPin, FiMail, FiActivity, FiSearch, FiMonitor } from "react-icons/fi";

const PatientForm = ({
    patientInfo,
    handleInputChange,
    suggestions,
    selectedSuggestionIndex,
    handleSuggestionKeyDown,
    handlePatientSelect,
    refDoctorSuggestions,
    handleRefDoctorSelect,
    nameRef,
    ageRef,
    genderRef,
    phoneRef,
    addressRef,
    emailRef,
    refDoctorRef,
    pcNameRef,
    nextRef // testSearchRef usually
}) => {

    const inputStyle = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all";
    const iconStyle = "absolute left-3 top-3.5 text-gray-400 text-lg";

    // Helper for enter key navigation
    const handleEnterFocus = (e, targetRef) => {
        if (e.key === "Enter") {
          e.preventDefault();
          targetRef?.current?.focus();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded-full"></span>
                Patient Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name (with search) */}
                <div className="relative col-span-1 md:col-span-2">
                    <FiSearch className={iconStyle} />
                    <input
                        ref={nameRef}
                        type="text"
                        name="name"
                        value={patientInfo.name}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            handleSuggestionKeyDown(e);
                            handleEnterFocus(e, ageRef);
                        }}
                        placeholder="Patient Name *"
                        className={inputStyle}
                        autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute bg-white border border-gray-100 rounded-xl w-full mt-2 z-50 shadow-xl max-h-60 overflow-y-auto overflow-hidden">
                            {suggestions.map((p, idx) => (
                                <li
                                    key={p._id || p.uid}
                                    onClick={() => handlePatientSelect(p)}
                                    className={`px-4 py-3 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-0 ${
                                        idx === selectedSuggestionIndex
                                            ? "bg-secondary/10 text-secondary font-medium"
                                            : "hover:bg-gray-50 text-gray-700"
                                    }`}
                                >
                                    {p.name} <span className="text-xs text-gray-400 ml-1">({p.pid})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Age */}
                <div className="relative">
                    <FiCalendar className={iconStyle} />
                    <input
                        ref={ageRef}
                        type="number"
                        name="age"
                        value={patientInfo.age}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, genderRef)}
                        placeholder="Age *"
                        className={inputStyle}
                    />
                </div>

                {/* Gender */}
                <div className="relative">
                    <FiUser className={iconStyle} />
                    <select
                        ref={genderRef}
                        name="gender"
                        value={patientInfo.gender}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, phoneRef)}
                        className={`${inputStyle} appearance-none`}
                    >
                        <option value="">Select Gender *</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                </div>

                {/* Phone */}
                <div className="relative">
                    <FiPhone className={iconStyle} />
                    <input
                        ref={phoneRef}
                        type="text"
                        name="phone"
                        value={patientInfo.phone}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, addressRef)}
                        placeholder="Contact Number *"
                        className={inputStyle}
                    />
                </div>

                {/* Address */}
                <div className="relative">
                    <FiMapPin className={iconStyle} />
                    <input
                        ref={addressRef}
                        type="text"
                        name="address"
                        value={patientInfo.address}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, emailRef)}
                        placeholder="Address *"
                        className={inputStyle}
                    />
                </div>

                {/* Email */}
                <div className="relative">
                    <FiMail className={iconStyle} />
                    <input
                        ref={emailRef}
                        type="email"
                        name="email"
                        value={patientInfo.email}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, refDoctorRef)}
                        placeholder="Email Address"
                        className={inputStyle}
                    />
                </div>

                {/* Ref Doctor */}
                <div className="relative">
                    <FiActivity className={iconStyle} />
                    <input
                        ref={refDoctorRef}
                        type="text"
                        name="refDoctor"
                        value={patientInfo.refDoctor}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            handleEnterFocus(e, pcNameRef);
                        }}
                        placeholder="Ref. Doctor"
                        className={inputStyle}
                        autoComplete="off"
                    />
                    {refDoctorSuggestions.length > 0 && (
                        <ul className="absolute bg-white border border-gray-100 rounded-xl w-full mt-2 z-50 shadow-xl max-h-48 overflow-y-auto">
                            {refDoctorSuggestions.map((doc) => (
                                <li
                                    key={doc._id || doc.id}
                                    onClick={() => handleRefDoctorSelect(doc)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                >
                                    {doc.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* PC Name */}
                <div className="relative">
                    <FiMonitor className={iconStyle} />
                    <input
                        ref={pcNameRef}
                        type="text"
                        name="pcName"
                        value={patientInfo.pcName}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterFocus(e, nextRef)}
                        placeholder="PC Name"
                        className={inputStyle}
                    />
                </div>
            </div>
        </div>
    );
};

export default PatientForm;
