// App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import Notification from "../components/Notification";
import { AuthProvider } from "../context/AuthContext";
import Advertisement from "../pages/AdvertisementPage";
import Dashboard from "../pages/DashboardPage";
import GetTicketsPage from "../pages/GetTicketsPage";
import Inventory from "../pages/InventoryPage";
import { Login } from "../pages/Login";
import Movie from "../pages/MoviePage";
import Seats from "../pages/SeatsPage";
import ShowTimePage from "../pages/ShowTimePage";
import Snacks from "../pages/SnacksPage";
import Users from "../pages/UserPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Notification />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/snacks" element={<Snacks />} />
            <Route path="/seats" element={<Seats />} />
            <Route path="/ads" element={<Advertisement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/movie" element={<Movie />} />
            <Route path="/users" element={<Users />} />
            <Route path="/show-time" element={<ShowTimePage />} />
            <Route path="/get-tickets" element={<GetTicketsPage />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRouter;
