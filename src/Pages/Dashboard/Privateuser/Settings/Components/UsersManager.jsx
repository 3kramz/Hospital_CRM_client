import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUserPlus, FaUserShield, FaEdit, FaTrash } from "react-icons/fa";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../../Hook/useAxiosSecure";
import useAuth from "../../../../../Hook/useAuth";
import { app as primaryApp } from "../../../../../../firebase/firebase.config";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
};

const UsersManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const axiosSecure = useAxiosSecure();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosSecure.get("/users");
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setLoading(false);
        }
    };

    const handleCreateUser = async (data) => {
        const adminPassword = data.adminPassword;
        let secondaryApp = null;
        try {
            const uniqueAppName = `SecondaryApp-${Date.now()}`;
            secondaryApp = initializeApp(firebaseConfig, uniqueAppName);
            const secondaryAuth = getAuth(secondaryApp);
            await signInWithEmailAndPassword(secondaryAuth, currentUser.email, adminPassword);
            
            const { email, password, name, roles, departments } = data;
            await createUserWithEmailAndPassword(secondaryAuth, email, password);
            
            // Backend now supports roles/departments arrays. We send arrays.
            const userInfo = { 
                name, 
                email, 
                roles: roles || [], 
                role: roles && roles.length > 0 ? roles[0] : "", // Backward compat
                departments: departments || [], 
                department: departments && departments.length > 0 ? departments[0] : "", // Backward compat
                createdAt: new Date().toISOString() 
            };
            await axiosSecure.post("/users", userInfo);
            await secondaryAuth.signOut(); 
            
            Swal.fire({ icon: 'success', title: 'User Created', timer: 1500, showConfirmButton: false });
            setIsModalOpen(false);
            reset();
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            Swal.fire({ icon: 'error', title: 'Operation Failed', text: error.message.includes("auth/wrong-password") ? "Incorrect Admin Password" : error.message });
        } finally {
            if (secondaryApp) await deleteApp(secondaryApp);
        }
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        
        // Gather Roles
        const roleCheckboxes = e.target.roles;
        let newRoles = [];
        if (roleCheckboxes instanceof RadioNodeList) {
            roleCheckboxes.forEach(cb => { if(cb.checked) newRoles.push(cb.value) });
        } else if (roleCheckboxes && roleCheckboxes.checked) {
            newRoles.push(roleCheckboxes.value);
        }

        // Gather Departments
        const deptCheckboxes = e.target.departments;
        let newDepts = [];
        if (deptCheckboxes instanceof RadioNodeList) {
            deptCheckboxes.forEach(cb => { if(cb.checked) newDepts.push(cb.value) });
        } else if (deptCheckboxes && deptCheckboxes.checked) {
            newDepts.push(deptCheckboxes.value);
        }

        const email = editingUser.email;
        try {
            await axiosSecure.patch("/users/role", { 
                email, 
                roles: newRoles, 
                role: newRoles[0] || "", // Compat
                departments: newDepts,
                department: newDepts[0] || "" // Compat 
            });
            Swal.fire({ icon: 'success', title: 'Access Updated', timer: 1500, showConfirmButton: false });
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: error.response?.data?.message });
        }
    };

    const openEditModal = (user) => { setEditingUser(user); setIsEditModalOpen(true); };

    const handleResetPassword = async (email) => {
        Swal.fire({ title: 'Are you sure?', text: `Send password reset email to ${email}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, send it!' }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const auth = getAuth(primaryApp);
                    await sendPasswordResetEmail(auth, email);
                    Swal.fire('Sent!', 'Password reset email has been sent.', 'success');
                } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                }
            }
        })
    };

    const handleDeleteUser = async (user) => {
        Swal.fire({ title: 'Are you sure?', text: `Delete user ${user.name}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!', confirmButtonColor: '#d33' }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/users/${user._id}`);
                    Swal.fire('Deleted!', 'User has been deleted.', 'success');
                    fetchUsers();
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete user.', 'error');
                }
            }
        })
    };

    if (loading && users.length === 0) return <div className="p-10 text-center text-gray-400">Loading users...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-end mb-4">
                 <button onClick={() => setIsModalOpen(true)} className="btn btn-primary text-white gap-2 shadow-lg shadow-primary/30">
                    <FaUserPlus /> Add New User
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="table w-full">
                <thead className="bg-gray-50/50">
                    <tr className="text-gray-500 uppercase text-xs tracking-wider">
                    <th className="py-4 pl-6">User Info</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th className="text-right pr-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="pl-6">
                            <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className="flex flex-wrap gap-1">
                                {(user.roles || [user.role]).map((r, i) => (
                                    <span key={i} className={`badge ${r === 'admin' ? 'badge-primary' : 'badge-ghost'} font-medium`}>
                                        {r}
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => openEditModal(user)} className="mt-1 text-gray-400 hover:text-info transition-colors btn btn-ghost btn-xs btn-circle" title="Edit Access">
                                <FaEdit />
                            </button>
                        </td>
                        <td className="text-gray-500 text-sm font-medium">
                            {(user.departments || (user.department ? [user.department] : [])).join(', ') || '-'}
                        </td>
                        <td className="text-right pr-6">
                            <div className="join">
                                <button onClick={() => handleResetPassword(user.email)} className="btn btn-xs join-item btn-outline" title="Reset Password">Reset</button>
                                <button onClick={() => handleDeleteUser(user)} className="btn btn-xs join-item btn-outline btn-error" title="Delete"><FaTrash /></button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {users.length === 0 && <div className="text-center py-12 text-gray-400">No users found.</div>}
            </div>

            {/* Edit Role Modal (User) */}
            {isEditModalOpen && editingUser && (
                <div className="modal modal-open backdrop-blur-sm">
                <div className="modal-box shadow-2xl rounded-2xl">
                    <h3 className="font-bold text-xl mb-1 text-gray-800">Edit User Access</h3>
                    <p className="mb-6 text-sm text-gray-500">Updating access for <span className="font-semibold text-primary">{editingUser.name}</span></p>
                    <form onSubmit={handleUpdateRole}>
                        <div className="form-control mb-4">
                            <label className="label"><span className="label-text font-medium">Roles</span></label>
                            <div className="flex flex-wrap gap-2">
                                {['doctor', 'admin', 'front_desk', 'lab_expert', 'sample_collection'].map(role => (
                                    <label key={role} className="flex items-center gap-2 cursor-pointer border p-2 rounded-lg hover:bg-gray-50">
                                        <input 
                                            type="checkbox" 
                                            name="roles" 
                                            value={role} 
                                            defaultChecked={(editingUser.roles || [editingUser.role]).includes(role)} 
                                            className="checkbox checkbox-primary checkbox-xs" 
                                        />
                                        <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-control mb-6">
                            <label className="label"><span className="label-text font-medium">Departments</span></label>
                            <div className="flex flex-wrap gap-2">
                                {['Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Urine/Stool'].map(dept => (
                                    <label key={dept} className="flex items-center gap-2 cursor-pointer border p-2 rounded-lg hover:bg-gray-50">
                                        <input 
                                            type="checkbox" 
                                            name="departments" 
                                            value={dept} 
                                            defaultChecked={(editingUser.departments || [editingUser.department]).includes(dept)} 
                                            className="checkbox checkbox-secondary checkbox-xs" 
                                        />
                                        <span className="text-sm">{dept}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost rounded-xl" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-xl px-6">Update Access</button>
                        </div>
                    </form>
                </div>
                </div>
            )}

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="modal modal-open backdrop-blur-sm">
                <div className="modal-box shadow-2xl rounded-2xl max-w-lg">
                    <h3 className="font-bold text-2xl mb-6 text-gray-800 border-b pb-4">New User</h3>
                    <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium">Name</span></label>
                                <input type="text" {...register("name", { required: true })} className="input input-bordered w-full" placeholder="John Doe"/>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium">Email</span></label>
                                <input type="email" {...register("email", { required: true })} className="input input-bordered w-full" placeholder="john@example.com"/>
                            </div>
                        </div>
                        
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Roles (Select Multiple)</span></label>
                            <div className="flex flex-wrap gap-4 p-3 border rounded-xl bg-gray-50">
                                {['doctor', 'admin', 'front_desk', 'lab_expert', 'sample_collection'].map(role => (
                                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" value={role} {...register("roles")} className="checkbox checkbox-primary checkbox-sm" />
                                        <span className="capitalize">{role.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Departments (Select Multiple)</span></label>
                            <div className="flex flex-wrap gap-4 p-3 border rounded-xl bg-gray-50">
                                {['Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Urine/Stool'].map(dept => (
                                    <label key={dept} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" value={dept} {...register("departments")} className="checkbox checkbox-secondary checkbox-sm" />
                                        <span>{dept}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Password</span></label>
                            <input type="password" {...register("password", { required: true, minLength: 6 })} className="input input-bordered w-full" placeholder="••••••••"/>
                            {errors.password && <span className="text-xs text-error mt-1">Min 6 chars required</span>}
                        </div>
                        
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                            <div className="form-control">
                                <label className="label p-0 mb-1"><span className="label-text font-bold text-red-500 flex items-center gap-2"><FaUserShield/> Admin Authorization</span></label>
                                <input type="password" {...register("adminPassword", { required: true })} className="input input-bordered w-full input-error bg-white" placeholder="Enter your Admin password to confirm"/>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-xl px-8">Create User</button>
                        </div>
                    </form>
                </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
