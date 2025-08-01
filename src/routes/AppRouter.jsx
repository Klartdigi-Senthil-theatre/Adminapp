// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/DashboardPage";
import Snacks from "../pages/SnacksPage";
import Seats from "../pages/SeatsPage";
import Advertisement from "../pages/AdvertisementPage";
import Inventory from "../pages/InventoryPage";
import Movie from "../pages/MoviePage";
import Users from "../pages/UserPage";
import ShowTime from "../pages/ShowTimePage";
import Notification from "../components/Notification";
import ShowTimePage from "../pages/ShowTimePage";

function AppRouter() {
  return (
    <Router>
      <Layout>
        <Notification />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/snacks" element={<Snacks />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/ads" element={<Advertisement />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/movie" element={<Movie />} />
          <Route path="/users" element={<Users />} />
          <Route path="/show-time" element={<ShowTime />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default AppRouter;
