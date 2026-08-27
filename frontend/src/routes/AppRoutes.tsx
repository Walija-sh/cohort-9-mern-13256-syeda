import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Auth from "@/pages/Auth";
import DashboardLayout from "@/layouts/DashboardLayout";
import Explorer from "@/pages/Explorer";
import NoteDetails from "@/pages/NoteDetails";
import NoteEditor from "@/pages/NoteEditor";
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
            <Route path="/dashboard" element={<Explorer />} />

            <Route path="/dashboard/folders/:folderId" element={<Explorer />} />

            <Route path="/dashboard/notes/:id" element={<NoteDetails />} />

            <Route path="/dashboard/notes/new" element={<NoteEditor />} />

            <Route
              path="/dashboard/folders/:folderId/notes/new"
              element={<NoteEditor />}
            />

            <Route path="/dashboard/notes/:id/edit" element={<NoteEditor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
