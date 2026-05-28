import { useState, useEffect, useRef, useCallback } from 'react';
import useTests from './useTests';

const useTestSelectionLogic = (paymentRef) => {
    const { testData } = useTests();

    // --- State ---
    const [tests, setTests] = useState([]);
    const [discounts, setDiscounts] = useState({});

    // Search
    const [testSearchQuery, setTestSearchQuery] = useState("");
    const [testSuggestions, setTestSuggestions] = useState([]);
    const [selectedTestIndex, setSelectedTestIndex] = useState(-1);

    // Undo/Redo
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // --- Refs ---
    const testSearchRef = useRef();

    // --- Helpers ---
    const collectTests = useCallback((obj, parentKey = "") => {
        const collected = [];
        for (const key in obj) {
            const value = obj[key];
            if (Array.isArray(value)) {
                value.forEach((test) =>
                    collected.push({
                        ...test,
                        name: test.name || test.testName,
                        department: test.department || test.dep || "",
                        dep: parentKey || key,
                    })
                );
            } else if (typeof value === "object" && value !== null) {
                collected.push(...collectTests(value, key));
            }
        }
        return collected;
    }, []);

    const allTests = useCallback(() => collectTests(testData), [testData, collectTests]);

    // --- Effects ---

    // Load from LocalStorage
    useEffect(() => {
        const storedTests = JSON.parse(localStorage.getItem("selectedTests")) || [];
        setTests(storedTests);
        const initialDiscounts = {};
        storedTests.forEach((test) => {
            initialDiscounts[test.test_id] = 0;
        });
        setDiscounts(initialDiscounts);
    }, []);

    // Search Logic
    useEffect(() => {
        if (!testSearchQuery.trim()) {
            setTestSuggestions([]);
            setSelectedTestIndex(-1);
            return;
        }
        const query = testSearchQuery.toLowerCase();
        const flattened = allTests();
        const filtered = flattened
            .filter(t => t.name.toLowerCase().includes(query))
            .slice(0, 10);
        setTestSuggestions(filtered);
        setSelectedTestIndex(-1);
    }, [testSearchQuery, allTests]);

    // Calculations
    const total = tests.reduce((sum, t) => sum + t.price, 0);
    const totalDiscount = tests.reduce((sum, t) => sum + (discounts[t.test_id] || 0), 0);

    // --- Actions ---

    const saveToHistory = () => {
        setUndoStack(prev => [...prev, { tests, discounts }]);
        setRedoStack([]);
    };

    const addTest = (test) => {
        if (tests.some((t) => t.test_id === test.test_id)) {
            alert("Test already added.");
            return;
        }
        saveToHistory();
        setTests([...tests, test]);
        setDiscounts(prev => ({ ...prev, [test.test_id]: 0 }));
        setTestSearchQuery("");
        setTestSuggestions([]);
        setSelectedTestIndex(-1);
        testSearchRef.current?.focus();
    };

    const removeTest = (testId) => {
        saveToHistory();
        setTests(tests.filter(t => t.test_id !== testId));
        const newDiscounts = { ...discounts };
        delete newDiscounts[testId];
        setDiscounts(newDiscounts);
    };

    const handleDiscountChange = (testId, val) => {
        setDiscounts((prev) => ({ ...prev, [testId]: parseFloat(val) || 0 }));
    };

    const handleTestKeyDown = (e) => {
        // Undo
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
            e.preventDefault();
            if (undoStack.length > 0) {
                const prevState = undoStack[undoStack.length - 1];
                setRedoStack(prev => [...prev, { tests, discounts }]);
                setTests(prevState.tests);
                setDiscounts(prevState.discounts);
                setUndoStack(prev => prev.slice(0, -1));
            }
            return;
        }
        // Redo
        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
            e.preventDefault();
            if (redoStack.length > 0) {
                const nextState = redoStack[redoStack.length - 1];
                setUndoStack(prev => [...prev, { tests, discounts }]);
                setTests(nextState.tests);
                setDiscounts(nextState.discounts);
                setRedoStack(prev => prev.slice(0, -1));
            }
            return;
        }
        // Remove Last
        if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
            e.preventDefault();
            if (tests.length > 0) {
                removeTest(tests[tests.length - 1].test_id);
            }
            return;
        }

        if (testSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedTestIndex((prev) => prev < testSuggestions.length - 1 ? prev + 1 : 0);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedTestIndex((prev) => prev > 0 ? prev - 1 : testSuggestions.length - 1);
                return;
            }
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (testSuggestions.length > 0 && selectedTestIndex >= 0) {
                addTest(testSuggestions[selectedTestIndex]);
            } else if (testSuggestions.length > 0 && selectedTestIndex === -1 && testSearchQuery.trim()) {
                addTest(testSuggestions[0]);
            } else if (!testSearchQuery.trim()) {
                paymentRef?.current?.focus();
            }
        }
    };

    return {
        // State
        tests,
        setTests, // Export for cleanup
        discounts,
        setDiscounts, // Export for cleanup
        testSearchQuery,
        setTestSearchQuery,
        testSuggestions,
        selectedTestIndex,
        total,
        totalDiscount,

        // Handlers
        addTest,
        removeTest,
        handleDiscountChange,
        handleTestKeyDown,

        // Refs
        testSearchRef
    };
};

export default useTestSelectionLogic;
