import { useState, useEffect, useRef } from 'react';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';
import usePatientFormLogic from './usePatientFormLogic';
import useTestSelectionLogic from './useTestSelectionLogic';

const usePatientEntry = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();

    // Billing specific State
    const [payment, setPayment] = useState(0);
    const [updatedDue, setUpdatedDue] = useState(0);
    const paymentRef = useRef();

    // Use Child Hooks
    const patientLogic = usePatientFormLogic();
    const testLogic = useTestSelectionLogic(paymentRef);

    // Destructure for easy access in billing logic
    const {
        patientInfo,
        setPatientInfo,
        previousDue,
        setPreviousDue
    } = patientLogic;

    const {
        tests,
        setTests,
        discounts,
        setDiscounts,
        total,
        totalDiscount
    } = testLogic;

    // Billing Calculations
    const grandTotal = total - totalDiscount;
    const finalTotal = grandTotal + previousDue;

    useEffect(() => {
        setUpdatedDue(Math.max(finalTotal - payment, 0));
    }, [payment, finalTotal]);


    // Save Logic
    const handleSaveAndPrint = async () => {
        const { name, age, gender, phone, address } = patientInfo;
        if (!name || !age || !gender || !phone || !address) {
            alert("Please fill in all required patient fields.");
            return;
        }
        if (tests.length === 0 && payment <= 0) {
            alert("Please select at least one test OR enter a payment amount.");
            return;
        }

        try {
            const { data: patientRes } = await axiosSecure.post("/patients/save", { patientInfo });
            if (!patientRes.success) {
                alert("Failed to save patient: " + patientRes.error);
                return;
            }

            const pid = patientRes.pid;
            const previousDueFromBackend = patientRes.previousDue || 0;

            setPatientInfo((prev) => ({ ...prev, pid }));
            setPreviousDue(previousDueFromBackend);

            const billData = {
                patientInfo: { ...patientInfo, pid },
                tests,
                discounts,
                payment,
                updatedDue,
                grandTotal: finalTotal,
                enteredBy: user?.displayName || user?.email,
            };

            const { data: billRes } = await axiosSecure.post("/tests/save-patient-bill", billData);

            if (billRes.success) {
                alert("Bill saved successfully.");
                const invoiceId = billRes.groupId || billRes.insertedId || billRes._id;
                if (invoiceId) {
                    const url = `${window.location.origin}/invoice/${invoiceId}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                } else {
                    alert("Bill saved, but could not open invoice automatically.");
                }

                // Reset
                setPatientInfo({
                    name: "", age: "", gender: "", phone: "", address: "", email: "", refDoctor: "", pcName: "", pid: ""
                });
                setTests([]);
                setDiscounts({});
                localStorage.removeItem("selectedTests");
                setPayment(0);
                setPreviousDue(0);
                setUpdatedDue(0);
            } else {
                alert("Failed to save bill: " + billRes.error);
            }
        } catch (err) {
            console.error("Error saving bill:", err);
            alert("Error saving bill. See console.");
        }
    };

    // Global Payment Focus
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                paymentRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    return {
        // Compose all props
        ...patientLogic,
        ...testLogic,

        // Billing Specific
        grandTotal,
        finalTotal,
        payment,
        setPayment,
        updatedDue,
        handleSaveAndPrint,
        paymentRef
    };
};

export default usePatientEntry;
