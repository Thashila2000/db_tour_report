import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import Home from "./pages/Home";
import DailyTask from "./pages/dailytask/DailyTask";
import MarketExecution from "./pages/MarketExecution";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page (No Layout) */}
        <Route path="/" element={<Login />} />

        {/* Main Layout Routes (Protected Pages) */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/daily-task" element={<DailyTask />} />
          <Route path="/market-execution" element={<MarketExecution />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;