import React from 'react'
import { Link } from 'react-router-dom'
const Navbar = () => {

  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <Link to='/'> <img src='' className="w-36" alt="logo_img" /> <span className='text-md font-bold'><p>Admin Panel</p></span></Link>
        
        <button  className='bg-gray-600 text-white px-5 py-2 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar