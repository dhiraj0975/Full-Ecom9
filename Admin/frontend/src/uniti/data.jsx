
// 📁 src/utils/data.js
export const areaChartData = {
    labels: ["Mar 1", "Mar 3", "Mar 5", "Mar 7", "Mar 9", "Mar 11", "Mar 13"],
    datasets: [
      {
        label: "Revenue",
        data: [10000, 32000, 21000, 18000, 29000, 26000, 34000],
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
      },
    ],
  };
  
  export const barChartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Earnings",
        data: [4000, 5000, 6000, 7500, 10000, 14500],
        backgroundColor: "rgb(54, 162, 235)",
      },
    ],
  };
  