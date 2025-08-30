import { ToastContainer } from "react-toastify"
import Navbar from "./components/Navbar"
import { Route, Routes, useLocation } from "react-router-dom"
import Footer from "./components/Footer"
import Production from "./pages/Production"
import Home from "./pages/Home"
import AdminHome from "./adminPage/AdminHome"
import RawMaterial from "./pages/RawMaterial"
import Stockin from "./pages/Stockin"
import Stockout from "./pages/Stockout"
import Material from "./pages/Material"
import Report from "./pages/Report"
import Login from "./pages/Login"

function App() {
  const location = useLocation();
  const hideNavbarFooter = location.pathname === "/"; 

  return (
    <>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />

        {!hideNavbarFooter && (
          <>
            <Navbar />
          </>
        )}
        
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/manager/home" element={<Home />} />
          <Route path="/worker/home" element={<Home />} />

          <Route path="/material" element={<Material />} />
          <Route path="/production" element={<Production />} />
          <Route path="/RawMaterial" element={<RawMaterial/>} />
          <Route path="/stockout" element={<Stockout />} />
          <Route path="/report" element={<Report />} />
        </Routes>


      </div>
    </>
  )
}

export default App

