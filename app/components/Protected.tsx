import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Protected() {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <Outlet />;
}