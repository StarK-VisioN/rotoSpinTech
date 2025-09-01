import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import Title from "../components/Title";

// Color mapping with actual visual colors
const COLOR_MAP = {
  black: '#000000',
  blue: '#0000FF', 
  green: '#008000',
  red: '#FF0000',
  white: '#FFFFFF',
  yellow: '#FFFF00'
};

const COLORS = ['#000000', '#0000FF', '#008000', '#FF0000', '#FFFFFF', '#FFFF00'];

const Prediction = () => {
  const [loading, setLoading] = useState(true);
  const [rawStock, setRawStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [sapProducts, setSapProducts] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [materialAnalysis, setMaterialAnalysis] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [rawStockRes, productsRes, sapProductsRes] = await Promise.all([
        axiosInstance.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/raw-stock`),
        axiosInstance.get(API_PATHS.ENTRY_PRODUCTS.GET),
        axiosInstance.get(API_PATHS.SAP_PRODUCTS.GET)
      ]);

      setRawStock(rawStockRes.data || []);
      setProducts(productsRes.data || []);
      setSapProducts(sapProductsRes.data || []);

      calculatePredictions(rawStockRes.data, productsRes.data, sapProductsRes.data);

    } catch (error) {
      console.error("Error fetching prediction data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = (rawStockData, productsData, sapProductsData) => {
    const availableMaterialsData = calculateAvailableMaterials(rawStockData);
    setAvailableMaterials(availableMaterialsData);
    
    const productDemand = calculateProductDemand(productsData);
    const productionPredictions = predictProduction(availableMaterialsData, productDemand, sapProductsData);
    const materialUsage = analyzeMaterialUsage(rawStockData, productsData);
    
    setPredictions(productionPredictions);
    setMaterialAnalysis(materialUsage);
  };

  const calculateAvailableMaterials = (rawStock) => {
    const materialsByColor = {};
    
    rawStock.forEach(entry => {
      entry.details?.forEach(detail => {
        const color = detail.color?.toLowerCase();
        const kgs = parseFloat(detail.kgs) || 0;
        
        if (color && kgs > 0) {
          materialsByColor[color] = (materialsByColor[color] || 0) + kgs;
        }
      });
    });
    
    return Object.entries(materialsByColor)
      .map(([color, kgs]) => ({
        name: color.charAt(0).toUpperCase() + color.slice(1),
        value: parseFloat(kgs.toFixed(2)),
        color: COLOR_MAP[color] || '#CCCCCC'
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const calculateProductDemand = (products) => {
    const demandByProduct = {};
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    products.forEach(product => {
      if (product.created_at && new Date(product.created_at) >= last30Days) {
        demandByProduct[product.sap_name] = (demandByProduct[product.sap_name] || 0) + (product.quantity || 0);
      }
    });
    
    return demandByProduct;
  };

  const predictProduction = (availableMaterialsData, productDemand, sapProducts) => {
    const predictions = [];
    
    availableMaterialsData.forEach(material => {
      const color = material.name.toLowerCase();
      const availableKg = material.value;
      
      const relevantProducts = sapProducts.filter(product => 
        product.color && product.color.toLowerCase().includes(color)
      );
      
      relevantProducts.forEach(product => {
        const demand = productDemand[product.sap_name] || 10;
        const possibleProduction = Math.floor(availableKg / 2);
        
        predictions.push({
          product: product.sap_name,
          color: material.name,
          colorCode: material.color,
          availableMaterial: availableKg,
          predictedProduction: possibleProduction,
          expectedDemand: demand,
          status: possibleProduction >= demand ? 'Sufficient' : 'Insufficient',
          gap: Math.abs(possibleProduction - demand)
        });
      });
    });
    
    return predictions.sort((a, b) => b.gap - a.gap);
  };

  const analyzeMaterialUsage = (rawStock, products) => {
    const usageByMonth = {};
    
    rawStock.forEach(entry => {
      if (entry.invoice_date) {
        const date = new Date(entry.invoice_date);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        entry.details?.forEach(detail => {
          const color = detail.color?.toLowerCase();
          const kgs = parseFloat(detail.kgs) || 0;
          
          if (color && kgs > 0) {
            if (!usageByMonth[month]) usageByMonth[month] = {};
            usageByMonth[month][color] = (usageByMonth[month][color] || 0) + kgs;
          }
        });
      }
    });
    
    const monthlyData = [];
    const months = Object.keys(usageByMonth).sort().slice(-6);
    
    months.forEach(month => {
      const monthData = { month };
      Object.entries(usageByMonth[month]).forEach(([color, kgs]) => {
        monthData[color] = parseFloat(kgs.toFixed(2));
      });
      monthlyData.push(monthData);
    });
    
    return monthlyData;
  };

  // Custom tooltip for pie chart with color indicators
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: payload[0].payload.color }}
            ></div>
            <p className="font-semibold">{payload[0].name}</p>
          </div>
          <p className="text-sm">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend for charts with color indicators
  const renderColorfulLegendText = (value, entry) => {
    const color = COLOR_MAP[value.toLowerCase()] || '#CCCCCC';
    return (
      <span className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: color }}
        ></div>
        {value}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="PRODUCTION" text2="PREDICTION & PLANNING" />
      </div>

      {/* Available Materials Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Available Raw Materials by Color (kg)</h2>
        {availableMaterials.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={availableMaterials}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}kg`}
              >
                {availableMaterials.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#666"
                    strokeWidth={entry.name.toLowerCase() === 'white' ? 1 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend formatter={renderColorfulLegendText} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No raw materials available for prediction
          </div>
        )}
      </div>

      {/* Production Predictions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Production Capacity vs Demand</h2>
        {predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">SAP Product</th>
                  <th className="px-4 py-2 border">Color</th>
                  <th className="px-4 py-2 border">Available Material (kg)</th>
                  <th className="px-4 py-2 border">Predicted Production</th>
                  <th className="px-4 py-2 border">Expected Demand</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 border">{prediction.product}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center justify-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: prediction.colorCode }}
                        ></div>
                        {prediction.color}
                      </div>
                    </td>
                    <td className="px-4 py-2 border">{prediction.availableMaterial.toFixed(2)}</td>
                    <td className="px-4 py-2 border">{prediction.predictedProduction}</td>
                    <td className="px-4 py-2 border">{prediction.expectedDemand}</td>
                    <td className={`px-4 py-2 border font-semibold ${
                      prediction.status === 'Sufficient' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {prediction.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No production predictions available
          </div>
        )}
      </div>

      {/* Material Usage Trend */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Material Usage Trend (Last 6 Months)</h2>
        {materialAnalysis.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={materialAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kg`, 'Usage']} />
              <Legend formatter={renderColorfulLegendText} />
              {materialAnalysis.length > 0 && 
                Object.keys(materialAnalysis[0])
                  .filter(key => key !== 'month')
                  .map((color, index) => (
                    <Line 
                      key={color}
                      type="monotone" 
                      dataKey={color} 
                      stroke={COLOR_MAP[color] || '#CCCCCC'} 
                      name={color.charAt(0).toUpperCase() + color.slice(1)}
                      strokeWidth={2}
                    />
                  ))
              }
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No material usage data available
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Production Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Priority Production</h3>
            {predictions.filter(p => p.status === 'Sufficient').length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {predictions
                  .filter(p => p.status === 'Sufficient')
                  .slice(0, 5)
                  .map((p, index) => (
                    <li key={index} className="mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: p.colorCode }}
                        ></div>
                        <span className="font-medium">{p.product}</span>
                        <span className="text-green-600">({p.predictedProduction} units)</span>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">No products with sufficient materials</p>
            )}
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">⚠️ Material Shortages</h3>
            {predictions.filter(p => p.status === 'Insufficient').length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {predictions
                  .filter(p => p.status === 'Insufficient')
                  .slice(0, 5)
                  .map((p, index) => (
                    <li key={index} className="mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: p.colorCode }}
                        ></div>
                        <span>Need more {p.color} for {p.product}</span>
                        <span className="text-red-600">(-{p.gap} units)</span>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">No material shortages detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;