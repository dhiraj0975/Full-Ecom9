// 📁 src/components/AreaChartBox.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { areaChartData } from "../uniti/data";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
  ChartDataLabels
);

const defaultData = {
  labels: ["A", "B", "C", "D"],
  datasets: [
    {
      label: "Example Data",
      data: [12, 19, 3, 5],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

function AreaChartBox({ data, title }) {
  // Calculate percentage for each slice
  const chartData = data || defaultData;
  const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percent}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white p-4 shadow rounded w-full h-full flex flex-col">
      <h3 className="mb-2 font-semibold">{title || 'Pie Chart'}</h3>
      <div className="relative w-full flex-1 min-h-[300px] max-h-[400px] h-full overflow-hidden">
        <Pie data={chartData} options={options} className="w-full h-full" />
      </div>
    </div>
  );
}

export default AreaChartBox;