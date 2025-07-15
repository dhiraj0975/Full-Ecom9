import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      title: { display: true, text: 'Month' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      title: { display: true, text: 'Users' },
    },
  },
};

function LineChartBox({ title, labels, data, areaLabels, areaData }) {
  const chartLabels = labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = data || [5, 8, 12, 20, 28, 35, 40, 50, 60, 75, 90, 110];
  // Multi-color line: each segment a different color
  const segmentColors = [
    '#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf', '#2ecc71', '#e67e22', '#e74c3c', '#8e44ad', '#16a085'
  ];
  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: "User Growth",
        data: chartData,
        fill: false,
        borderColor: segmentColors,
        borderWidth: 4,
        pointBackgroundColor: segmentColors,
        pointBorderColor: '#fff',
        pointRadius: 8,
        pointHoverRadius: 12,
        tension: 0.3,
        segment: {
          borderColor: ctx => segmentColors[ctx.p0DataIndex % segmentColors.length],
        },
      },
    ],
  };
  // Dummy month-wise user names
  const dummyUsers = [
    ['Ramesh', 'Suresh'],
    ['Priya'],
    ['Amit', 'Neha'],
    ['Vikas'],
    ['Anjali', 'Rohit'],
    ['Sunita'],
    ['Deepak', 'Meena'],
    ['Kiran'],
    ['Manoj', 'Pooja'],
    ['Sanjay'],
    ['Geeta'],
    ['Vivek', 'Nisha']
  ];
  // Dynamic area line chart data
  const areaLineLabels = areaLabels || chartLabels;
  const areaLineData = areaData || [3, 7, 10, 18, 25, 30, 38, 45, 55, 65, 80, 100];
  const areaDataObj = {
    labels: areaLineLabels,
    datasets: [
      {
        label: 'User Activity',
        data: areaLineData,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(54, 162, 235, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 200, 83, 0.4)');
          return gradient;
        },
        borderColor: '#36a2eb',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#36a2eb',
        pointRadius: 7,
        pointHoverRadius: 10,
        tension: 0.5,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 10,
        shadowColor: 'rgba(54,162,235,0.3)'
      }
    ]
  };
  return (
    <div className="bg-white p-4 shadow rounded w-full h-full">
      <h3 className="mb-2 font-semibold">{title || 'Line Chart'}</h3>
      <Line data={lineData} options={options} style={{ width: '100%', height: '100%' }} />
      {/* Second unique line chart (gradient area) */}
     
    </div>
  );
}

export default LineChartBox; 