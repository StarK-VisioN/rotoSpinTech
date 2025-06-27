import { ToastContainer } from "react-toastify"
import Navbar from "./components/Navbar"
import { Route, Routes } from "react-router-dom"
import Footer from "./components/Footer"
import Production from "./pages/Production"
import Home from "./pages/Home"
import Stockin from "./pages/Stockin"
import Stockout from "./pages/Stockout"
import Material from "./pages/Material"
import Report from "./pages/Report"

function App() {
  return (
    <>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/material" element={<Material />}/>
          <Route path="/production" element={<Production/>}/>
          <Route path="/stockin" element={<Stockin />}/>
          <Route path="/stockout" element={<Stockout />}/>
          <Route path="/report" element={<Report />}/>
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App
