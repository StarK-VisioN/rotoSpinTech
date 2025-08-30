import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Package, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const Production = () => {
  // Sample data - replace with your actual data source
  const [orders, setOrders] = useState([
    {
      orderId: '001',
      productModel: 'A500',
      productColor: 'RED',
      quantity: 50,
      deadline: '2025-09-15',
      status: 'completed'
    },
    {
      orderId: '002',
      productModel: 'A400',
      productColor: 'Blue',
      quantity: 30,
      deadline: '2025-09-10',
      status: 'in-process'
    },
    {
      orderId: '003',
      productModel: 'B500',
      productColor: 'Blue',
      quantity: 75,
      deadline: '2025-09-20',
      status: 'pending'
    },
    {
      orderId: '004',
      productModel: 'A400',
      productColor: 'yellow',
      quantity: 25,
      deadline: '2025-09-05',
      status: 'completed'
    },

  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productColor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'orderId':
          return a.orderId.localeCompare(b.orderId);
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Get status counts
  const statusCounts = useMemo(() => {
    return {
      completed: orders.filter(o => o.status === 'completed').length,
      inProcess: orders.filter(o => o.status === 'in-process').length,
      pending: orders.filter(o => o.status === 'pending').length
    };
  }, [orders]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-process':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in-process':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (deadline, status) => {
    if (status === 'completed') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Production Management
            </h1>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-700">{statusCounts.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">In Process</p>
                  <p className="text-2xl font-bold text-yellow-700">{statusCounts.inProcess}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Pending Orders</p>
                  <p className="text-2xl font-bold text-red-700">{statusCounts.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Product Model, or Color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-process">In Process</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="orderId">Sort by Order ID</option>
                <option value="quantity">Sort by Quantity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product Model</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Color</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className={`hover:bg-gray-50 ${isOverdue(order.deadline, order.status) ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{order.productModel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{order.productColor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 ${isOverdue(order.deadline, order.status) ? 'text-red-600' : 'text-gray-900'}`}>
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.deadline)}
                        {isOverdue(order.deadline, order.status) && (
                          <span className="text-xs font-medium text-red-600">(Overdue)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={getStatusBadge(order.status)}>
                          {order.status === 'in-process' ? 'In Process' :
                            order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            <span>Total Quantity: {filteredOrders.reduce((sum, order) => sum + order.quantity, 0)} units</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;
