import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Auth from "@/pages/Auth";
import DashboardLayout from "@/layouts/DashboardLayout";
import Folders from "@/pages/Folders";
import Notes from "@/pages/Notes";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicRoute from "@/routes/PublicRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Notes />} />
            <Route path="/folders" element={<Folders />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
