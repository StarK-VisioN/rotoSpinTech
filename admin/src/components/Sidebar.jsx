import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-gray-300 border-r-2'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            
            <NavLink to='/overall' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.overall_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Over All</p>
            </NavLink>
            
            <NavLink to='/entryform' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.entryProduct_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Entry Product Form</p>
            </NavLink>
            
            <NavLink to='/addworker' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.worker_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Add New Worker</p>
            </NavLink>

            <NavLink to='/add' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.add_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Add Stock</p>
            </NavLink>
        
            <NavLink to='/orders' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.order_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Place New Orders</p>
            </NavLink>
        
            <NavLink to='/report' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.report_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>Generate Report</p>
            </NavLink>
        
            <NavLink to='/raw' className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'>
                <img src={assets.raw_icon} className='w-5 h-5' alt="" />
                <p className='hidden md:block'>View Raw Material</p>
            </NavLink>
        
        </div>
    </div>
  )
}

export default Sidebar