// 📁 src/pages/Dashboard.jsx
import React, { useContext } from "react";
import Layout from './../component/Layout';
import Card from './../component/Card';
import AreaChartBox from './../component/AreaChartBox';
import BarChartBox from './../component/BarChartBox';
import LineChartBox from './../component/LineChartBox';
import { DashboardContext } from '../context/DashboardContext';

function Dashboard() {
  const {
    recentUsers,
    recentProducts,
    recentRetailers,
    userCount,
    productCount,
    retailerCount,
    categoryCount,
    pieData,
    userStatusPie,
    retailerStatusPie,
    combinedStatusPie,
    lineChartLabels,
    lineChartData,
    areaChartLabels,
    areaChartData,
  } = useContext(DashboardContext);

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4">
          <Card 
            title="Total Users" 
            color="bg-blue-500" 
            icon="👤" 
            value={userCount} 
            percent={userCount > 0 ? '+100%' : '0%'} 
            percentColor="text-white" 
          />
          <Card 
            title="Total Retailers" 
            color="bg-yellow-400" 
            icon="🏪"
            value={retailerCount} 
            percent={retailerCount > 0 ? '+100%' : '0%'} 
            percentColor="text-white" 
          />
          <Card 
            title="Total Products" 
            color="bg-green-500" 
            icon="📦" 
            value={productCount} 
            percent={productCount > 0 ? '+100%' : '0%'} 
            percentColor="text-white" 
          />
          <Card 
            title="Total Categories" 
            color="bg-red-500" 
            icon="🗂️" 
            value={categoryCount} 
            percent={categoryCount > 0 ? '+100%' : '0%'} 
            percentColor="text-white" 
          />
        </div>
        {/* Pie Charts */}
        <div className="w-full max-w-none grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full h-[400px] flex items-center justify-center">
            <AreaChartBox data={combinedStatusPie} title="Retailers & Products Status" />
          </div>
          <div className="w-full h-[400px] flex items-center justify-center">
            <LineChartBox title="User Growth Trend" labels={lineChartLabels} data={lineChartData} areaLabels={areaChartLabels} areaData={areaChartData} />
          </div>
        </div>
        {/* Recent Tables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* Recent Users */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4 text-lg text-blue-700 flex items-center gap-2">
              <span className="text-2xl">👤</span> Recently Added Users
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {[...recentUsers]
                    .sort((a, b) => b.created_at && a.created_at ? new Date(b.created_at) - new Date(a.created_at) : 0)
                    .slice(0, 5)
                    .map((u, i) => (
                      <tr key={u.id || i} className="border-b hover:bg-blue-50 transition">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Recent Products */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4 text-lg text-green-700 flex items-center gap-2">
              <span className="text-2xl">📦</span> Recently Added Products
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3">Product Name</th>
                  </tr>
                </thead>
                <tbody>
                  {[...recentProducts]
                    .sort((a, b) => b.created_at && a.created_at ? new Date(b.created_at) - new Date(a.created_at) : 0)
                    .slice(0, 5)
                    .map((p, i) => (
                      <tr key={p.id || i} className="border-b hover:bg-green-50 transition">
                        <td className="p-3 font-medium">{p.name}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Recent Retailers */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4 text-lg text-purple-700 flex items-center gap-2">
              <span className="text-2xl">🏪</span> Recently Added Retailers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-3">Retailer Name</th>
                  </tr>
                </thead>
                <tbody>
                  {[...recentRetailers]
                    .sort((a, b) => b.created_at && a.created_at ? new Date(b.created_at) - new Date(a.created_at) : 0)
                    .slice(0, 5)
                    .map((r, i) => (
                      <tr key={r.id || i} className="border-b hover:bg-purple-50 transition">
                        <td className="p-3 font-medium">{r.name}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;