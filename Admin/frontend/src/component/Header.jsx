// 📁 src/components/Header.jsx
import React, { useState, useRef } from "react";
import LogOutDropdown from "./LogOutDropdown";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Header() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();

  // Debounced global search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/auth/global-search?q=${encodeURIComponent(value)}`);
        setResults(res.data.results || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Handle result click
  const handleResultClick = (item) => {
    setShowDropdown(false);
    setSearch("");
    // Navigate based on entity type
    switch (item.type) {
      case "retailer":
        navigate(`/retailers?retailer_id=${item.id}`);
        break;
      case "product":
        navigate(`/products?product_id=${item.id}`);
        break;
      case "user":
        navigate(`/users?user_id=${item.id}`);
        break;
      case "role":
        navigate(`/roles?role_id=${item.id}`);
        break;
      case "category":
        navigate(`/categories?category_id=${item.id}`);
        break;
      case "subcategory":
        navigate(`/subcategories?subcategory_id=${item.id}`);
        break;
      case "bank":
        navigate(`/retailer-bank?bank_id=${item.id}`);
        break;
      default:
        break;
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <header className="bg-white shadow-md px-6 py-3 flex items-center justify-between relative">
      {/* 🔵 Left: Dashboard Title */}
      <h2 className="text-2xl font-semibold text-gray-800">📊 Dashboard</h2>

      {/* 🔵 Right Section */}
      <div className="flex items-center space-x-4">
        {/* 🔍 Global Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything..."
            value={search}
            onChange={handleSearchChange}
            className="border border-gray-300 focus:border-blue-500 outline-none px-4 py-2 rounded-full w-64 text-sm shadow-sm transition-all duration-200"
            onFocus={() => search && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          <button className="absolute right-2 top-2 text-gray-500 hover:text-blue-500 text-lg">
            🔍
          </button>
          {/* Dropdown Results */}
          {showDropdown && (
            <div className="absolute left-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No results found</div>
              ) : (
                Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type}>
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b">{type}</div>
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                        onClick={() => handleResultClick(item)}
                      >
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                        <span className="font-medium text-gray-800">{item.name || item.title || item.email}</span>
                        {item.extra && <span className="text-xs text-gray-500 ml-2">{item.extra}</span>}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 🔽 Dropdown */}
        <LogOutDropdown />
      </div>
    </header>
  );
}

export default Header;
