import React, { useState } from 'react';
import { Package, Users, Plus,ClipboardCheck , ShoppingCart, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AdminHome = () => {
    const [orders] = useState([
        { id: '001', customer: '1', items: 3, total: '₹8000', status: 'pending', date: '2025-08-29' },
        { id: '002', customer: '1', items: 1, total: '₹8000', status: 'completed', date: '2025-08-29' },
        { id: '003', customer: '2', items: 5, total: '₹16000', status: 'processing', date: '2025-08-28' },
        { id: '004', customer: '1', items: 2, total: '₹6000', status: 'completed', date: '2025-08-28' },
    ]);

    const [stockItems] = useState([
        { name: 'Red500', quantity: 45, status: 'good' },
        { name: 'Blue00', quantity: 12, status: 'low' },
        { name: 'Yellow500', quantity: 28, status: 'good' },
        { name: 'Blue500', quantity: 5, status: 'critical' },
        { name: 'Red200', quantity: 67, status: 'good' },
        { name: 'Blue200', quantity: 28, status: 'good' },
        { name: 'Red100', quantity: 5, status: 'critical' },
        { name: 'Yellow100', quantity: 67, status: 'good' },
        
    ]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'processing': return <TrendingUp className="w-4 h-4 text-blue-500" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'shipped': return <Package className="w-4 h-4 text-purple-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-100';
            case 'low': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.replace('$', '')), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                    Generate New order
                </button>
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
                    <Users className="w-5 h-5" />
                    Add Worker
                </button>
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
                    <ClipboardCheck  className="w-5 h-5" />
                    Add task/Notice
                </button>
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                    Add new Product
                </button>

            </div>

            {/* Main Content Grid */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Orders Section - Large Box */}
  <div className="lg:col-span-2">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                                    <p className="text-sm text-gray-500">Manage and track customer orders</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-semibold text-gray-900">{totalOrders}</div>
                                    <div className="text-gray-500">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-yellow-600">{pendingOrders}</div>
                                    <div className="text-gray-500">Pending</div>
                                </div>

                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-2 font-medium text-gray-600">Order ID</th>
                                        {/* <th className="text-left py-3 px-2 font-medium text-gray-600">Customer ID</th> */}
                                        <th className="text-left py-3 px-2 font-medium text-gray-600">Quantity</th>
                                        {/* <th className="text-left py-3 px-2 font-medium text-gray-600">Total</th> */}
                                        <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                                        <th className="text-left py-3 px-2 font-medium text-gray-600">Deadline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-2 font-medium text-blue-600">{order.id}</td>
                                            {/* <td className="py-3 px-2 text-gray-900">{order.customer}</td> */}
                                            <td className="py-3 px-2 text-gray-600">{order.items}</td>
                                            {/* <td className="py-3 px-2 font-medium text-gray-900">{order.total}</td> */}
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize text-sm">{order.status}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-500 text-sm">{order.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                View All Orders →
                            </button>
                        </div>
                    </div>
  </div>

  {/* Right Section - Contains Stock + Tasks */}
  <div className="lg:col-span-2">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Stock Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock</h3>
              <p className="text-sm text-gray-500">Inventory</p>
            </div>
          </div>
          <div className="space-y-3">
            {stockItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-500">Kg: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notice & Tasks Board</h3>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">order number 2 complet today</p>
              <p className="text-xs text-gray-500">Due: 2025-08-30</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Raw material truck arriving tomorrow.</p>
              <p className="text-xs text-gray-500">Due: 2025-09-05</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Client Meeting</p>
              <p className="text-xs text-gray-500">Due: 2025-09-10</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>



            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">124</div>
                    <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Active Workers</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-yellow-600">15</div>
                    <div className="text-sm text-gray-600">Low Stock Items</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">$12,450</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;