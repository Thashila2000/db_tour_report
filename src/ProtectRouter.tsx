// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";  

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuth = localStorage.getItem("isAuth") === "true";
  return isAuth ? children : <Navigate to="/" />;
}
