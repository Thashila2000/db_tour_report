import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import DailyTask from "./pages/dailytask/DailyTask";
import MarketExecution from "./pages/MarketExecution";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectRouter";
import ReportsPage from "./components/ReportsPage";
import AdminDashboard from "./components/AdminDashboard"; 
// 1. Import the new Page
import AdminReportsPage from "./components/AdminReportsPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* User Protected Pages (With Sidebar/MainLayout) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/daily-task" element={<DailyTask />} />
          <Route path="/market-execution" element={<MarketExecution />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Admin Protected Pages (Standalone Full White Style) */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Reports Page Route */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;