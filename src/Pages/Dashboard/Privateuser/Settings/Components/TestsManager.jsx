import { useState, useEffect } from "react";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../../Hook/useAxiosSecure";
import useAuth from "../../../../../Hook/useAuth";
import TestCard from "./TestCard";
import TestActions from "./TestActions";
import TestModal from "./TestModal";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
};

const TestsManager = () => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [testSearch, setTestSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testMode, setTestMode] = useState("add"); // 'add' or 'edit'
    const [editingTest, setEditingTest] = useState(null);
    const [adminPassForTest, setAdminPassForTest] = useState("");

    const axiosSecure = useAxiosSecure();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        const filtered = tests.filter(test => 
            (test.testName || test.name || "").toLowerCase().includes(testSearch.toLowerCase()) ||
            (test.department || "").toLowerCase().includes(testSearch.toLowerCase())
        );
        setFilteredTests(filtered);
    }, [testSearch, tests]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get("/tests/test-list");
            setTests(res.data);
            setFilteredTests(res.data);
        } catch (error) {
            console.error("Failed to fetch tests", error);
        } finally {
            setLoading(false);
        }
    };

    const openTestModal = (mode, test = null) => {
        setTestMode(mode);
        if (mode === 'edit' && test) {
            setEditingTest(test);
        } else {
            setEditingTest(null);
        }
        setAdminPassForTest("");
        setIsTestModalOpen(true);
    };

    const verifyAdminAndAction = async (actionCallback) => {
        if (!adminPassForTest) {
            Swal.fire('Error', 'Please enter admin password', 'error');
            return;
        }
        let secondaryApp = null;
        try {
            const uniqueAppName = `VerifyApp-${Date.now()}`;
            secondaryApp = initializeApp(firebaseConfig, uniqueAppName);
            const secondaryAuth = getAuth(secondaryApp);
            await signInWithEmailAndPassword(secondaryAuth, currentUser.email, adminPassForTest);
            await secondaryAuth.signOut();
        } catch (e) {
            if (secondaryApp) await deleteApp(secondaryApp);
            Swal.fire('Error', 'Incorrect Admin Password', 'error');
            return;
        }
        if (secondaryApp) await deleteApp(secondaryApp);
        await actionCallback();
    };

    const handleSaveTest = async (testData) => {
        await verifyAdminAndAction(async () => {
            try {
                if (testMode === 'add') {
                    await axiosSecure.post("/tests/test", testData);
                    Swal.fire({ icon: 'success', title: 'Test Added', timer: 1500, showConfirmButton: false });
                } else {
                    await axiosSecure.patch(`/tests/test/${editingTest._id}`, testData);
                    Swal.fire({ icon: 'success', title: 'Test Updated', timer: 1500, showConfirmButton: false });
                }
                setIsTestModalOpen(false);
                fetchTests();
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to save test', 'error');
            }
        });
    };

    const handleDeleteTest = async (test) => {
        const { value: password } = await Swal.fire({
            title: 'Enter Admin Password',
            input: 'password',
            inputLabel: `To delete ${test.testName || test.name}`,
            inputPlaceholder: 'Enter your password',
            showCancelButton: true
        });

        if (password) {
             let secondaryApp = null;
            try {
                const uniqueAppName = `VerifyApp-${Date.now()}`;
                secondaryApp = initializeApp(firebaseConfig, uniqueAppName);
                const secondaryAuth = getAuth(secondaryApp);
                await signInWithEmailAndPassword(secondaryAuth, currentUser.email, password);
                await secondaryAuth.signOut();
                if (secondaryApp) await deleteApp(secondaryApp);
                
                await axiosSecure.delete(`/tests/test/${test._id}`);
                Swal.fire('Deleted!', 'Test has been deleted.', 'success');
                fetchTests();

            } catch (e) {
                 if (secondaryApp) await deleteApp(secondaryApp);
                 Swal.fire('Error', 'Incorrect Password', 'error');
            }
        }
    };

    if (loading && tests.length === 0) return <div className="p-10 text-center text-gray-400">Loading tests...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Actions Bar */}
            <TestActions 
                search={testSearch} 
                setSearch={setTestSearch} 
                onAdd={() => openTestModal('add')} 
            />

            {/* Tests List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTests.map((test) => (
                    <TestCard 
                        key={test._id} 
                        test={test} 
                        onEdit={(test) => openTestModal('edit', test)} 
                        onDelete={handleDeleteTest}
                    />
                ))}
                 {filteredTests.length === 0 && (
                     <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                         <p className="text-lg">No tests found matching your search.</p>
                         <button className="btn btn-ghost btn-sm mt-2 text-primary" onClick={() => setTestSearch("")}>Clear Search</button>
                     </div>
                 )}
            </div>

            {/* Test Modal (Add/Edit) */}
            <TestModal 
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                onSubmit={handleSaveTest}
                initialData={editingTest}
                mode={testMode}
                adminPass={adminPassForTest}
                setAdminPass={setAdminPassForTest}
            />
        </div>
    );
};

export default TestsManager;
