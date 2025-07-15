// 📁 src/App.jsx
import React from "react";
import  "./App.css";

import AppRoutes from './../AppRoutes';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <DashboardProvider>
      <div className="flex h-screen">
        <AppRoutes/>
      </div>
    </DashboardProvider>
  );
}

export default App;

