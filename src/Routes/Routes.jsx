import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import NotFound from "../Pages/NotFound/NotFound";
import Login from "../Pages/Login/Login";

import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";
import PatientEntry from "../Pages/Dashboard/Privateuser/PatientEntry";
import ForgetPassword from "../Pages/ForgetPassword/ForgetPassword";


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
        ],
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
