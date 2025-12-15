import React from "react";
import usePatientEntry from "../../../../Hook/usePatientEntry";
import PatientForm from "./PatientForm";
import TestSelection from "./TestSelection";
import BillingSummary from "./BillingSummary";

const PatientEntry = () => {
  const {
    // State
    patientInfo,
    suggestions,
    selectedSuggestionIndex,
    refDoctorSuggestions,
    tests,
    discounts,
    testSearchQuery,
    setTestSearchQuery,
    testSuggestions,
    selectedTestIndex,
    total,
    totalDiscount,
    previousDue,
    finalTotal,
    payment,
    setPayment,
    updatedDue,
    
    // Handlers
    handleInputChange,
    handleSuggestionKeyDown,
    handlePatientSelect,
    handleRefDoctorSelect,
    handleDiscountChange,
    removeTest,
    addTest,
    handleTestKeyDown,
    handleSaveAndPrint,
    
    // Refs
    nameRef,
    ageRef,
    genderRef,
    phoneRef,
    addressRef,
    emailRef,
    refDoctorRef,
    pcNameRef,
    paymentRef,
    testSearchRef
  } = usePatientEntry();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Reception Entry</h1>
            <p className="text-gray-500 text-sm">Register patient and generate invoice</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient Information & Test Selection */}
        <div className="lg:col-span-2 space-y-6">
          <PatientForm
             patientInfo={patientInfo}
             handleInputChange={handleInputChange}
             suggestions={suggestions}
             selectedSuggestionIndex={selectedSuggestionIndex}
             handleSuggestionKeyDown={handleSuggestionKeyDown}
             handlePatientSelect={handlePatientSelect}
             refDoctorSuggestions={refDoctorSuggestions}
             handleRefDoctorSelect={handleRefDoctorSelect}
             nameRef={nameRef}
             ageRef={ageRef}
             genderRef={genderRef}
             phoneRef={phoneRef}
             addressRef={addressRef}
             emailRef={emailRef}
             refDoctorRef={refDoctorRef}
             pcNameRef={pcNameRef}
             nextRef={testSearchRef}
          />
          
          <TestSelection
             tests={tests}
             discounts={discounts}
             handleDiscountChange={handleDiscountChange}
             removeTest={removeTest}
             testSearchQuery={testSearchQuery}
             setTestSearchQuery={setTestSearchQuery}
             testSuggestions={testSuggestions}
             selectedTestIndex={selectedTestIndex}
             handleTestKeyDown={handleTestKeyDown}
             addTest={addTest}
             testSearchRef={testSearchRef}
          />
        </div>

        {/* Right Column: Billing Summary */}
        <div className="lg:col-span-1 space-y-6">
           <BillingSummary
              total={total}
              totalDiscount={totalDiscount}
              previousDue={previousDue}
              finalTotal={finalTotal}
              payment={payment}
              setPayment={setPayment}
              updatedDue={updatedDue}
              handleSaveAndPrint={handleSaveAndPrint}
              paymentRef={paymentRef}
           />
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;
