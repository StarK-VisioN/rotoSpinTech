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
import EntryForm from './pages/EntryForm';

function App() {

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
        <>
          <Navbar />
          <hr />
            {/* <Sidebar /> */}
            <div className="w-full text-gray-600 text-base">
              <Routes>
                <Route path="/overall" element={<Overall />} />
                <Route path="/entryform" element={<EntryForm />} />
                <Route path="/addworker" element={<AddWorker />} />
                <Route path="/add" element={<AddStock />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/report" element={<Report />} />
                <Route path="/raw" element={<RawMaterial />} />
              </Routes>
            </div>
       
        </>

    </div>
  )
}

export default App
