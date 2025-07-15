import React from "react";

function Card({ title, icon = "⭐", value = "N/A", percent = "", percentColor = "", color }) {
  return (
    <div className={`p-5 rounded-md shadow-lg flex justify-between items-center text-white ${color} hover:scale-[1.02] transition-transform duration-200`}>
      
      {/* Left Icon in Circle */}
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/30 text-3xl shadow-inner">
        {icon}
      </div>

      {/* Right Content */}
      <div className="text-right space-y-1">
        <div className="text-sm font-medium tracking-wide uppercase opacity-90">{title}</div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className={`text-sm font-semibold ${percentColor}`}>{percent}</div>
        <button className="text-xs underline mt-1 hover:text-white/80 transition">View Details</button>
      </div>
    </div>
  );
}

export default Card;
