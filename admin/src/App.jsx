import { ToastContainer } from 'react-toastify';
import { Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

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
                <Route path="/add" />
                <Route path="/list"  />
                <Route path="/orders" />
              </Routes>
            </div>
          </div>
        </>

    </div>
  )
}

export default App
