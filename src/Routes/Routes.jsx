import { createBrowserRouter } from "react-router-dom";
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
import Settings from "../Pages/Dashboard/Privateuser/Settings/Settings";


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
            path: "settings",
            element: <Settings />,
          },
        ],
      },
      {
            path: "invoice/:groupId",
            element: <Invoice />,
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
