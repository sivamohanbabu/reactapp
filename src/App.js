// stock-frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const App = () => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stock/IBM"); // Replace with your stock symbol
      setStockData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Process data for Chart.js
  const processData = (data) => {
    const timeSeries = data["Time Series (5min)"];
    const labels = Object.keys(timeSeries).reverse();
    const prices = Object.values(timeSeries)
      .map((item) => item["1. open"])
      .reverse();
    const volumes = Object.values(timeSeries)
      .map((item) => item["5. volume"])
      .reverse();

    // For Pie Chart: Using the last day's data for example
    const lastDayData = timeSeries[labels[0]];
    const pieData = {
      labels: ["Open", "High", "Low", "Close"],
      datasets: [
        {
          label: "Stock Prices",
          data: [
            parseFloat(lastDayData["1. open"]),
            parseFloat(lastDayData["2. high"]),
            parseFloat(lastDayData["3. low"]),
            parseFloat(lastDayData["4. close"]),
          ],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF5733"],
        },
      ],
    };

    return {
      line: {
        labels,
        datasets: [
          {
            label: "Stock Price",
            data: prices,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      bar: {
        labels,
        datasets: [
          {
            label: "Volume",
            data: volumes,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      },
      pie: pieData,
    };
  };

  const chartData = stockData ? processData(stockData) : {};

  return (
    <div>
      <h1>Stock Data</h1>
      <div style={{ width: "600px", margin: "0 auto" }}>
        <h2>Stock Price Over Time</h2>
        <Line data={chartData.line} />
      </div>
      <div style={{ width: "600px", margin: "0 auto" }}>
        <h2>Volume Over Time</h2>
        <Bar data={chartData.bar} />
      </div>
      <div style={{ width: "600px", margin: "0 auto" }}>
        <h2>Stock Prices (Pie Chart)</h2>
        <Pie data={chartData.pie} />
      </div>
    </div>
  );
};

export default App;
