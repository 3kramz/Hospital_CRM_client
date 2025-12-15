import  { useEffect, useState } from 'react';
import { FaUserShield } from "react-icons/fa";

const TestModal = ({ isOpen, onClose, onSubmit, initialData, mode, adminPass, setAdminPass }) => {
    const [formData, setFormData] = useState({ 
        testName: "", 
        price: "", 
        department: "", 
        roomNumber: "", 
        test_id: "" 
    });

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                testName: initialData.testName || initialData.name, 
                price: initialData.price,
                department: initialData.department || "",
                roomNumber: initialData.roomNumber || "",
                test_id: initialData.test_id
            });
        } else if (isOpen && mode === 'add') {
            setFormData({ testName: "", price: "", department: "", roomNumber: "", test_id: "" });
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <div className="modal modal-open backdrop-blur-sm">
            <div className="modal-box shadow-2xl rounded-2xl max-w-md">
                <h3 className="font-bold text-2xl mb-1 text-gray-800">{mode === 'add' ? 'Add New Test' : 'Edit Test'}</h3>
                <p className="text-sm text-gray-500 mb-6 border-b pb-4">Enter test details below</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Test Name</span></label>
                        <input type="text" value={formData.testName} onChange={(e) => setFormData({...formData, testName: e.target.value})} className="input input-bordered w-full focus:ring-primary/20" required placeholder="e.g. CBC" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Price (৳)</span></label>
                            <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="input input-bordered w-full" required placeholder="0.00"/>
                        </div>
                            <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Room / Machine</span></label>
                            <input type="text" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} className="input input-bordered w-full" placeholder="e.g. Room 104" />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Department</span></label>
                        <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="select select-bordered w-full">
                            <option value="">Select Department</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Biochemistry">Biochemistry</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Radiology">Radiology</option>
                            <option value="Urine/Stool">Urine/Stool</option>
                        </select>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-6">
                        <div className="form-control">
                            <label className="label p-0 mb-1"><span className="label-text font-bold text-red-500 flex items-center gap-2"><FaUserShield/> Admin Verification</span></label>
                            <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="input input-bordered w-full input-error bg-white" placeholder="Enter your Admin password" required />
                        </div>
                    </div>

                        <div className="modal-action">
                        <button type="button" className="btn btn-ghost rounded-xl" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary rounded-xl px-8">{mode === 'add' ? 'Save Test' : 'Update Test'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestModal;
