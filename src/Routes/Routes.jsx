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
            element: <Navigate to="assign-test" replace />,
          },
          {
            path: "patient-entry",
            element: <PatientEntry />,
          },
           {
            path: "assign-test",
            element: <AssignTest />,
          },
          {
            path: "reports",
            element: <Reports />,
          },
          {
            path: "patients",
            element: <Patients />,
          },
          {
            path: "settings",
            element: (
              <AdminRoute>
                <Settings />
              </AdminRoute>
            ),
          },
          {
            path: "lab-board",
            element: <LabBoard />,
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
