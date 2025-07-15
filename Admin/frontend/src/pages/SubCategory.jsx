import React, { useEffect, useState } from "react";
import Header from "../component/Header";
import {
  getProductSubCategories,
  createProductSubCategory,
  updateProductSubCategory,
  deleteProductSubCategory,
  getProductCategories,
} from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", name: "" });
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const res = await getProductSubCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSubCategories(data);
    } catch (err) {
      toast.error("Failed to fetch subcategories");
      console.error("Subcategory fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getProductCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error("Category fetch error:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      return toast.warning("All fields are required");
    }

    try {
 const payload = {
  name: form.name,
  category_id: parseInt(form.category), // ✅ Matches backend now
};

      if (editId) {
        await updateProductSubCategory(editId, payload);
        toast.success("Subcategory updated!");
      } else {
        await createProductSubCategory(payload);
        toast.success("Subcategory added!");
      }

      setForm({ category: "", name: "" });
      setEditId(null);
      fetchSubCategories();
    } catch (err) {
      toast.error("Something went wrong!");
      console.error("Error saving subcategory:", err);
    }
  };

  const handleEdit = (item) => {
    setForm({ category: item.category_id.toString(), name: item.name });
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      try {
        await deleteProductSubCategory(id);
        toast.success("Subcategory deleted!");
        fetchSubCategories();
      } catch (err) {
        toast.error("Failed to delete subcategory");
      }
    }
  };

  const filteredSubCategories = subCategories.filter((subCat) => {
    const categoryName =
      categories.find((cat) => cat.id === subCat.category_id)?.name || "";
    return (
      subCat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <Header />
      <div className="w-full p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Subcategory List */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            📋 Subcategory List ({filteredSubCategories.length})
          </h2>
          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 rounded w-full sm:w-64"
              />
            </div>
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">S/N</th>
                  <th className="p-2 border">Subcategory Name</th>
                  <th className="p-2 border">Category Name</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No subcategories found for '{searchQuery}'.
                    </td>
                  </tr>
                ) : (
                  filteredSubCategories.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 text-center">
                      <td className="p-2 text-[15px] border">{index + 1}</td>
                      <td className="p-2 text-[15px] border">{item.name}</td>
                      <td className="p-2 text-[15px] border">
                        {categories.find((cat) => item.category_id === cat.id)?.name || "Unknown"}
                      </td>
                      <td className="p-2 text-[15px] border">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="p-2 text-[15px] border">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            {editId ? "✏️ Edit" : "➕ Add"} Subcategory
          </h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow flex flex-col gap-4"
          >
            <div>
              <label className="block mb-1 text-sm font-medium">Select Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Subcategory Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter subcategory name"
                className="w-full border p-2 rounded"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 active:scale-95 active:bg-green-500 hover:bg-blue-700 text-white py-2 rounded"
            >
              {editId ? "Update Subcategory" : "Add Subcategory"}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default SubCategory;
