import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    // Limpar tokens inválidos
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
