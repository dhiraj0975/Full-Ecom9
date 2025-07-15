// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { getAdminProfile, logoutAdmin } from "../api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminProfile()
      .then(res => {
        setUserData(res.data.user || res.data.data || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!userData) return <div className="p-6 text-red-500">Failed to load profile.</div>;

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-2">Profile</h2>
      <p className="text-sm text-gray-600 mb-6">Home &gt; Profile</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Profile Image and Name */}
        <div className="flex flex-col items-center bg-white p-6 rounded shadow">
          <div className="border-4 border-yellow-400 rounded-full p-1">
            <img
              src={userData.profile_img || "/src/pages/DHiraj.PNG"}
              alt="Profile"
              className="rounded-full w-40 h-40 object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold mt-4">{userData.full_name || userData.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{userData.gender || ""}</p>
          <button
            className="p-2 border border-amber-300 rounded-md bg-gray-300 active:scale-95 active:bg-red-400 px-5 mt-5"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        {/* Right - Profile Details */}
        <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="font-semibold">Full Name</label>
            <input
              value={userData.full_name || userData.name || ""}
              readOnly
              className="w-full p-2 mt-1 bg-gray-200 rounded shadow"
            />
          </div>
          <div>
            <label className="font-semibold">Date of Birth</label>
            <input
              value={userData.dob || ""}
              readOnly
              className="w-full p-2 mt-1 bg-gray-200 rounded shadow"
            />
          </div>
          <div>
            <label className="font-semibold">Gender</label>
            <input
              value={userData.gender || ""}
              readOnly
              className="w-full p-2 mt-1 bg-gray-200 rounded shadow capitalize"
            />
          </div>
          <div className="col-span-2">
            <label className="font-semibold">Address</label>
            <textarea
              value={userData.address || ""}
              readOnly
              rows={3}
              className="w-full p-2 mt-1 bg-gray-200 rounded shadow resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
