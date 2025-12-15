import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import useAxiosSecure from './useAxiosSecure';

const usePatientFormLogic = () => {
    const axiosSecure = useAxiosSecure();
    const location = useLocation();

    // --- State ---
    const [patientInfo, setPatientInfo] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        email: "",
        refDoctor: "",
        pcName: "",
        pid: "",
    });

    const [previousDue, setPreviousDue] = useState(0);

    // Search Suggestions
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    // Ref Doctor Search
    const [refDoctorQuery, setRefDoctorQuery] = useState("");
    const [refDoctorSuggestions, setRefDoctorSuggestions] = useState([]);

    // --- Refs ---
    const nameRef = useRef();
    const ageRef = useRef();
    const genderRef = useRef();
    const phoneRef = useRef();
    const addressRef = useRef();
    const emailRef = useRef();
    const refDoctorRef = useRef();
    const pcNameRef = useRef();

    // --- Effects ---

    // Initialize from location state
    useEffect(() => {
        if (location.state?.patient) {
            const p = location.state.patient;
            setPatientInfo({
                name: p.name,
                age: p.age,
                gender: p.gender,
                phone: p.phone,
                address: p.address,
                email: p.email || "",
                refDoctor: p.refDoctor || "",
                pcName: p.pcName || "",
                pid: p.pid,
            });
            setPreviousDue(p.dueAmount || 0);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Search Logic
    const searchPatients = useCallback(
        debounce(async (query) => {
            if (!query.trim()) {
                setSuggestions([]);
                return;
            }
            try {
                const { data } = await axiosSecure.get(`/patients/search?q=${query}`);
                setSuggestions(data);
            } catch (err) {
                console.error("Error searching patients:", err);
                setSuggestions([]);
            }
        }, 400),
        [axiosSecure]
    );

    const searchRefDoctors = useCallback(
        debounce(async (query) => {
            if (!query.trim()) {
                setRefDoctorSuggestions([]);
                return;
            }
            try {
                const { data } = await axiosSecure.get(`/doctors/search?q=${query}`);
                setRefDoctorSuggestions(data);
            } catch (err) {
                console.error("Error searching doctors:", err);
                setRefDoctorSuggestions([]);
            }
        }, 400),
        [axiosSecure]
    );

    // --- Actions ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientInfo((prev) => ({ ...prev, [name]: value }));

        if (name === "name") {
            setSearchQuery(value);
            searchPatients(value);
        }
        if (name === "refDoctor") {
            setRefDoctorQuery(value);
            searchRefDoctors(value);
        }

        if (name === "name" && value === "") {
            setPatientInfo({
                name: "",
                age: "",
                gender: "",
                phone: "",
                address: "",
                email: "",
                refDoctor: "",
                pcName: "",
                pid: "",
            });
            setPreviousDue(0);
        }
    };

    const handlePatientSelect = (patient) => {
        setPatientInfo({
            name: patient.name,
            age: patient.age || "",
            gender: patient.gender || "",
            phone: patient.phone || "",
            address: patient.address || "",
            email: patient.email || "",
            refDoctor: patient.refDoctor || "",
            pcName: patient.pcName || "",
            pid: patient.pid || "",
        });
        setPreviousDue(patient.dueAmount || 0);
        setSearchQuery(`${patient.name} (${patient.pid})`);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
    };

    const handleRefDoctorSelect = (doctor) => {
        setPatientInfo((prev) => ({ ...prev, refDoctor: doctor.name }));
        setRefDoctorSuggestions([]);
    };

    const handleSuggestionKeyDown = (e) => {
        if (!suggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : 0);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : suggestions.length - 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                handlePatientSelect(suggestions[selectedSuggestionIndex]);
            } else {
                ageRef.current.focus();
            }
        }
    };

    return {
        // State
        patientInfo,
        setPatientInfo, // Export setter for reset/saving
        previousDue,
        setPreviousDue, // Export setter
        suggestions,
        selectedSuggestionIndex,
        refDoctorSuggestions,

        // Handlers
        handleInputChange,
        handlePatientSelect,
        handleRefDoctorSelect,
        handleSuggestionKeyDown,

        // Refs
        nameRef,
        ageRef,
        genderRef,
        phoneRef,
        addressRef,
        emailRef,
        refDoctorRef,
        pcNameRef
    };
};

export default usePatientFormLogic;
