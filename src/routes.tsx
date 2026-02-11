import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={ ['admin']} />,
      children: [
        { index: true, Component: AdminDashboard },
      ],
      },
  {
    path: "user",
    element: <ProtectedRoute allowedRoles={ ['user', 'admin']} />,
  children: [
    { index: true, Component: UserDashboard },
  ],
      },
{ path: "*", Component: NotFound },
    ],
  },
]);
