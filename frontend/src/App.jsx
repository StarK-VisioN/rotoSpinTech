import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

import Production from "./pages/Production";
import Home from "./pages/Home";
import Stockin from "./pages/Stockin";
import Stockout from "./pages/Stockout";
import Material from "./pages/Material";
import Report from "./pages/Report";
import Login from "./pages/Login";

// Admin Pages
import EntryProduct from "./adminPage/EntryProduct";
import EntryRawStock from "./adminPage/EntryRawStock";
import AddStaff from "./adminPage/AddStaff"; 
import Prediction from "./adminPage/Prediction";

function App() {
  const location = useLocation();
  const hideNavbarFooter = location.pathname === "/";

  const token = localStorage.getItem("token");

  // Protect route wrapper
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/" replace />;
  };

  return (
    <>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />
        {!hideNavbarFooter && <Navbar />}

        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Home */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:role/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Common Pages */}
          <Route
            path="/material"
            element={
              <ProtectedRoute>
                <Material />
              </ProtectedRoute>
            }
          />
          <Route
            path="/production"
            element={
              <ProtectedRoute>
                <Production />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/active-production"
            element={
              <ProtectedRoute>
                <Production />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stockin"
            element={
              <ProtectedRoute>
                <Stockin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stockout"
            element={
              <ProtectedRoute>
                <Stockout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />

          {/* Admin Pages */}
          <Route
            path="/admin/entry-product"
            element={
              <ProtectedRoute>
                <EntryProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/entry-raw-stock"
            element={
              <ProtectedRoute>
                <EntryRawStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-staff"
            element={
              <ProtectedRoute>
                <AddStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prediction"
            element={
              <ProtectedRoute>
                <Prediction />
              </ProtectedRoute>
            }
          />

          {/* Manager Pages */}
          <Route
            path="/manager/prediction"
            element={
              <ProtectedRoute>
                <Prediction />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!hideNavbarFooter && <Footer />}
      </div>
    </>
  );
}

export default App;