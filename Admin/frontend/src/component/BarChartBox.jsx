// 📁 src/components/BarChartBox.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { barChartData } from "../uniti/data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChartBox({ title }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div className="bg-white p-4 shadow rounded w-full h-full">
      <h3 className="mb-2 font-semibold">{title || 'Bar Chart Example'}</h3>
      <Bar data={barChartData} options={options} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default BarChartBox;