import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

function PublicRoute() {
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
