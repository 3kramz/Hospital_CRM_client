import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../Layout/Main";
import NotFound from "../Pages/NotFound/NotFound";
import Login from "../Pages/Login/Login";

import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";

import ForgetPassword from "../Pages/ForgetPassword/ForgetPassword";
import PatientEntry from "../Pages/Dashboard/Privateuser/PatientEntry/PatientEntry";
import AssignTest from "../Pages/Dashboard/Privateuser/AssignTest/AssignTest";
import Invoice from "../Pages/Dashboard/Privateuser/Invoice/Invoice";
import Reports from "../Pages/Dashboard/Privateuser/Reports/Reports";
import Patients from "../Pages/Dashboard/Privateuser/Patients/Patients";
import PublicPatientHistory from "../Pages/Dashboard/Privateuser/Patients/PublicPatientHistory";
import Settings from "../Pages/Dashboard/Privateuser/Settings/Settings";
import AdminRoute from "./AdminRoute";
import LabBoard from "../Pages/Dashboard/Privateuser/LabBoard/LabBoard";
import RoleRoute from "./RoleRoute";
import DashboardHomeRedirect from "../Pages/Dashboard/DashboardHomeRedirect";
import DashboardHome from "../Pages/Dashboard/DashboardHome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardHomeRedirect />, 
          },
          {
            path: "dashboard-home",
            element: <DashboardHome />,
          },
          {
            path: "patient-entry",
            element: (
              <RoleRoute allowedRoles={['front_desk', 'admin']}>
                <PatientEntry />
              </RoleRoute>
            ),
          },
           {
            path: "assign-test",
            element: (
              <RoleRoute allowedRoles={['front_desk', 'admin']}>
                <AssignTest />
              </RoleRoute>
            ),
          },
          {
            path: "reports",
            element: <Reports />, // All logged in users
          },
          {
            path: "patients",
            element: <Patients />, // All logged in users
          },
          {
            path: "settings",
            element: (
              <RoleRoute allowedRoles={['admin']}>
                <Settings />
              </RoleRoute>
            ),
          },
          {
            path: "lab-board",
            element: (
              <RoleRoute allowedRoles={['lab_expert', 'sample_collection']}>
                <LabBoard />
              </RoleRoute>
            ),
          },
        ],
      },
      {
            path: "invoice/:groupId",
            element: <Invoice />,
          },
      {
         path: "patient-history/:pid",
         element: <PublicPatientHistory />,
      },
    ],
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
