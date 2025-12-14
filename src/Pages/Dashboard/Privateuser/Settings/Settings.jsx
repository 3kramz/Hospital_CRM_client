import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUserPlus, FaUserShield, FaEdit, FaTrash, FaSearch, FaFlask, FaPlus } from "react-icons/fa";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import useAuth from "../../../../Hook/useAuth";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";
import Swal from "sweetalert2";

import { app as primaryApp } from "../../../../../firebase/firebase.config";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID,
};


const Settings = () => {
  const [activeTab, setActiveTab] = useState("tests"); // Default to Tests as requested
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]); // All tests
  const [filteredTests, setFilteredTests] = useState([]); // For search
  const [testSearch, setTestSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false); // User Add Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false); // Test Add/Edit Modal
  const [testMode, setTestMode] = useState("add"); // 'add' or 'edit'
  const [editingTest, setEditingTest] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const axiosSecure = useAxiosSecure();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'tests') {
        const filtered = tests.filter(test => 
            (test.testName || test.name || "").toLowerCase().includes(testSearch.toLowerCase()) ||
            (test.department || "").toLowerCase().includes(testSearch.toLowerCase())
        );
        setFilteredTests(filtered);
    }
  }, [testSearch, tests, activeTab]);

  const fetchData = async () => {
    // Only show full loader if we don't have data for the active tab
    if (activeTab === 'users' && users.length === 0) setLoading(true);
    if (activeTab === 'tests' && tests.length === 0) setLoading(true);

    try {
        if (activeTab === 'users') {
            const res = await axiosSecure.get("/users");
            setUsers(res.data);
        } else {
            const res = await axiosSecure.get("/tests/test-list");
            setTests(res.data);
            setFilteredTests(res.data);
        }
    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setLoading(false);
    }
  };

  // --- User Management Logic (Keep existing) ---
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
        
        // Use first role/department if single selection or maintain old structure for primary
        // But backend now supports roles/departments arrays. We send arrays.
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
        fetchData();
      } catch (error) {
          console.error("Error creating user:", error);
          Swal.fire({ icon: 'error', title: 'Operation Failed', text: error.message.includes("auth/wrong-password") ? "Incorrect Admin Password" : error.message });
      } finally {
          if (secondaryApp) await deleteApp(secondaryApp);
      }
  };
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
        fetchData();
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
                  fetchData();
              } catch (error) {
                   Swal.fire('Error', 'Failed to delete user.', 'error');
              }
          }
      })
  };


  // --- Test Management Logic ---
  const [testForm, setTestForm] = useState({ testName: "", price: "", department: "", roomNumber: "", test_id: "" });
  const [adminPassForTest, setAdminPassForTest] = useState("");

  const openTestModal = (mode, test = null) => {
      setTestMode(mode);
      if (mode === 'edit' && test) {
          setEditingTest(test);
          setTestForm({
              testName: test.testName || test.name, 
              price: test.price,
              department: test.department || "",
              roomNumber: test.roomNumber || "",
              test_id: test.test_id
          });
      } else {
          setTestForm({ testName: "", price: "", department: "", roomNumber: "", test_id: "" });
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

  const handleSaveTest = async (e) => {
      e.preventDefault();
      await verifyAdminAndAction(async () => {
          try {
              if (testMode === 'add') {
                  await axiosSecure.post("/tests/test", testForm);
                  Swal.fire({ icon: 'success', title: 'Test Added', timer: 1500, showConfirmButton: false });
              } else {
                  await axiosSecure.patch(`/tests/test/${editingTest._id}`, testForm);
                  Swal.fire({ icon: 'success', title: 'Test Updated', timer: 1500, showConfirmButton: false });
              }
              setIsTestModalOpen(false);
              fetchData();
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
              fetchData();

          } catch (e) {
               if (secondaryApp) await deleteApp(secondaryApp);
               Swal.fire('Error', 'Incorrect Password', 'error');
          }
      }
  };


  if (loading && users.length === 0 && tests.length === 0) return <HospitalLoader />;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 fade-in font-outfit">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tests, users, and hospital configurations</p>
        </div>
        
        {/* Modern Tab Switcher */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <button 
                onClick={() => setActiveTab('tests')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'tests' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
            >
                Test Management
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
            >
                User Management
            </button>
        </div>
      </div>
      
      {/* --- CONTENT AREA --- */}

      {/* Tests Tab Content */}
      {activeTab === 'tests' && (
      <div className="space-y-6 animate-fade-in-up">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {/* Search */}
            <div className="relative w-full md:w-96">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search tests by name or department..." 
                    className="input input-bordered pl-10 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                />
            </div>
            {/* Add Button */}
            <button 
                onClick={() => openTestModal('add')} 
                className="btn btn-primary text-white gap-2 px-6 shadow-lg shadow-primary/30 w-full md:w-auto hover:scale-105 transition-transform"
            >
                <FaPlus /> Add New Test
            </button>
        </div>

        {/* Tests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTests.map((test) => (
                <div key={test._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-12 -mt-12 transition-all group-hover:from-primary/10"></div>
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className={`p-2 rounded-lg ${test.department === 'Hematology' ? 'bg-red-50 text-red-500' : test.department === 'Radiology' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'}`}>
                            <FaFlask className="text-xl" />
                        </div>
                        <span className="badge badge-sm badge-ghost">{test.department}</span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1" title={test.testName || test.name}>{test.testName || test.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">৳{test.price}</p>
                    <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">Room: <span className="text-gray-600 font-medium">{test.roomNumber || 'N/A'}</span></p>

                    <div className="flex gap-2 mt-auto">
                        <button onClick={() => openTestModal('edit', test)} className="btn btn-sm btn-outline btn-info flex-1 gap-1 group-hover:bg-info group-hover:text-white transition-colors">
                            <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDeleteTest(test)} className="btn btn-sm btn-outline btn-error flex-1 gap-1 group-hover:bg-error group-hover:text-white transition-colors">
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))}
             {filteredTests.length === 0 && (
                 <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                     <p className="text-lg">No tests found matching your search.</p>
                     <button className="btn btn-ghost btn-sm mt-2 text-primary" onClick={() => setTestSearch("")}>Clear Search</button>
                 </div>
             )}
        </div>
      </div>
      )}


      {/* Users Tab Content */}
      {activeTab === 'users' && (
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
      </div>
      )}

      {/* --- MODALS --- (Kept largely the same but ensured styling consistency) */}

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

      {/* Test Modal (Add/Edit) */}
      {isTestModalOpen && (
          <div className="modal modal-open backdrop-blur-sm">
            <div className="modal-box shadow-2xl rounded-2xl max-w-md">
                <h3 className="font-bold text-2xl mb-1 text-gray-800">{testMode === 'add' ? 'Add New Test' : 'Edit Test'}</h3>
                <p className="text-sm text-gray-500 mb-6 border-b pb-4">Enter test details below</p>
                <form onSubmit={handleSaveTest} className="space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Test Name</span></label>
                        <input type="text" value={testForm.testName} onChange={(e) => setTestForm({...testForm, testName: e.target.value})} className="input input-bordered w-full focus:ring-primary/20" required placeholder="e.g. CBC" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Price (৳)</span></label>
                            <input type="number" value={testForm.price} onChange={(e) => setTestForm({...testForm, price: e.target.value})} className="input input-bordered w-full" required placeholder="0.00"/>
                        </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Room / Machine</span></label>
                            <input type="text" value={testForm.roomNumber} onChange={(e) => setTestForm({...testForm, roomNumber: e.target.value})} className="input input-bordered w-full" placeholder="e.g. Room 104" />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Department</span></label>
                        <select value={testForm.department} onChange={(e) => setTestForm({...testForm, department: e.target.value})} className="select select-bordered w-full">
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
                            <input type="password" value={adminPassForTest} onChange={(e) => setAdminPassForTest(e.target.value)} className="input input-bordered w-full input-error bg-white" placeholder="Enter your Admin password" required />
                        </div>
                    </div>

                     <div className="modal-action">
                        <button type="button" className="btn btn-ghost rounded-xl" onClick={() => setIsTestModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary rounded-xl px-8">{testMode === 'add' ? 'Save Test' : 'Update Test'}</button>
                    </div>
                </form>
            </div>
          </div>
      )}

    </div>
  );
};

export default Settings;
