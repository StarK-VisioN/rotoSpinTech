import { ToastContainer } from 'react-toastify';
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AddStock from './pages/AddStock';
import AddWorker from './pages/AddWroker';
import Orders from './pages/Orders';
import RawMaterial from './pages/RawMaterial';
import Report from './pages/Report';
import Overall from './pages/Overall'

function App() {

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
        <>
          <Navbar />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/overall" element={<Overall />} />
                <Route path="/addworker" element={<AddWorker />} />
                <Route path="/add" element={<AddStock />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/report" element={<Report />} />
                <Route path="/raw" element={<RawMaterial />} />
              </Routes>
            </div>
          </div>
        </>

    </div>
  )
}

export default App
