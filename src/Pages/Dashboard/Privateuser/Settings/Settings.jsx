import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUserPlus, FaUserShield, FaEdit, FaTrash } from "react-icons/fa";
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const axiosSecure = useAxiosSecure();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await axiosSecure.get("/users");
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (data) => {
    const adminPassword = data.adminPassword;
    let secondaryApp = null;
    
    try {
        const uniqueAppName = `SecondaryApp-${Date.now()}`;
        secondaryApp = initializeApp(firebaseConfig, uniqueAppName);
        const secondaryAuth = getAuth(secondaryApp);

    
        await signInWithEmailAndPassword(secondaryAuth, currentUser.email, adminPassword);
        
       
        const { email, password, name, role } = data;
        await createUserWithEmailAndPassword(secondaryAuth, email, password);
        
        const userInfo = {
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };
        
        await axiosSecure.post("/users", userInfo);
        
       
        await secondaryAuth.signOut(); 
        
        Swal.fire({
            icon: 'success',
            title: 'User Created',
            text: `User ${name} has been created successfully.`,
            timer: 2000,
            showConfirmButton: false
        });
        
        setIsModalOpen(false);
        reset();
        fetchUsers();

    } catch (error) {
        console.error("Error creating user:", error);
        Swal.fire({
            icon: 'error',
            title: 'Operation Failed',
            text: error.message.includes("auth/wrong-password") ? "Incorrect Admin Password" : error.message
        });
    } finally {
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleUpdateRole = async (e) => {
      e.preventDefault();
      const newRole = e.target.role.value;
      const email = editingUser.email;

      try {
          await axiosSecure.patch("/users/role", { email, role: newRole });
           Swal.fire({
            icon: 'success',
            title: 'Role Updated',
            text: `User role has been updated to ${newRole}`,
            timer: 2000,
            showConfirmButton: false
        });
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } catch (error) {
          console.error("Error updating role", error);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.response?.data?.message || "Failed to update role"
        });
      }
  };

  const openEditModal = (user) => {
      setEditingUser(user);
      setIsEditModalOpen(true);
  };

  const handleResetPassword = async (email) => {
      Swal.fire({
          title: 'Are you sure?',
          text: `Send password reset email to ${email}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, send it!'
      }).then(async (result) => {
          if (result.isConfirmed) {
            try {
                const auth = getAuth(primaryApp);
                await sendPasswordResetEmail(auth, email);
                Swal.fire(
                    'Sent!',
                    'Password reset email has been sent.',
                    'success'
                );
            } catch (error) {
                 Swal.fire(
                    'Error',
                    'Failed to send reset email: ' + error.message,
                    'error'
                );
            }
          }
      })
  };

  if (loading) return <HospitalLoader />;

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-sm text-gray-500">Manage users and roles</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary text-white flex items-center gap-2"
        >
          <FaUserPlus /> Add New User
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="table w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover">
                <td>
                  <div className="font-medium text-gray-800">{user.name}</div>
                </td>
                <td className="text-gray-600">{user.email}</td>
                <td>
                   <div className="flex items-center gap-2">
                       <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                          {user.role}
                       </span>
                       <button onClick={() => openEditModal(user)} className="btn btn-ghost btn-xs text-info" title="Edit Role">
                           <FaEdit />
                       </button>
                   </div>
                </td>
                <td>
                  <button 
                    onClick={() => handleResetPassword(user.email)}
                    className="btn btn-xs btn-outline btn-warning"
                    title="Send Password Reset Email"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
             {users.length === 0 && (
                <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">No users found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && editingUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit User Role</h3>
            <p className="mb-4 text-sm text-gray-500">Updating role for <b>{editingUser.name}</b> ({editingUser.email})</p>
            <form onSubmit={handleUpdateRole}>
                <div className="form-control">
                    <label className="label"><span className="label-text">Select New Role</span></label>
                    <select name="role" defaultValue={editingUser.role} className="select select-bordered w-full">
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                        <option value="frontdesk">Front Desk</option>
                        <option value="lab_expert">Lab Expert</option>
                    </select>
                </div>
                <div className="modal-action">
                    <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Role</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New User</h3>
            <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
                
                {/* Name */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Name</span></label>
                    <input 
                        type="text" 
                        {...register("name", { required: true })} 
                        className="input input-bordered w-full" 
                        placeholder="Full Name"
                    />
                </div>

                 {/* Email */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input 
                        type="email" 
                        {...register("email", { required: true })} 
                        className="input input-bordered w-full" 
                        placeholder="user@hospitam.com"
                    />
                </div>

                 {/* Role */}
                <div className="form-control">
                    <label className="label"><span className="label-text">Role</span></label>
                    <select {...register("role", { required: true })} className="select select-bordered w-full">
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                        <option value="frontdesk">Front Desk</option>
                        <option value="lab_expert">Lab Expert</option>
                    </select>
                </div>

                 {/* New User Password */}
                 <div className="form-control">
                    <label className="label"><span className="label-text">New User Password</span></label>
                    <input 
                        type="password" 
                        {...register("password", { required: true, minLength: 6 })} 
                        className="input input-bordered w-full" 
                        placeholder="******"
                    />
                    {errors.password && <span className="text-xs text-error">Min 6 chars</span>}
                </div>

                <div className="divider">Admin Verification</div>
                
                 {/* Admin Password */}
                 <div className="form-control">
                    <label className="label"><span className="label-text font-bold text-primary">Your Admin Password</span></label>
                    <input 
                        type="password" 
                        {...register("adminPassword", { required: true })} 
                        className="input input-bordered w-full input-primary" 
                        placeholder="Confirm with your password"
                    />
                </div>

                <div className="modal-action">
                    <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create User</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
