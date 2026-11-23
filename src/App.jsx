import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { NutritionPage } from "./pages/NutritionPage";
import { ProgressPage } from "./pages/ProgressPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SearchPage } from "./pages/SearchPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { RemindersPage } from "./pages/RemindersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SupportPage } from "./pages/SupportPage";
import { AdminSupportPage } from "./pages/AdminSupportPage";
import { NotFoundPage } from "./pages/NotFoundPage";
function App() {
  return <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {
    /* Public Entry Pages */
  }
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {
    /* Protected App Shell */
  }
              <Route
    element={<ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>}
  >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile/:username" element={<PublicProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/support" element={<SupportPage />} />

                {
    /* Admin-only Routes */
  }
                <Route
    path="/admin/support"
    element={<AdminRoute>
                      <AdminSupportPage />
                    </AdminRoute>}
  />
              </Route>

              {
    /* 404 Catch-All */
  }
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>;
}
export {
  App as default
};
