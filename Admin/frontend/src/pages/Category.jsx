import { useEffect, useState } from "react";
import Header from "./../component/Header";
import { Edit, Trash, Search, Plus, Save, X, Package, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Category() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", img_url: "" });
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [image, setImage] = useState(null);
  const pageSize = 8;

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getProductCategories();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.warning("Category name is required!");
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (image) formData.append('image', image);
      if (editId !== null) {
        await updateProductCategory(editId, formData);
        toast.success("Category updated successfully!");
      } else {
        await createProductCategory(formData);
        toast.success("Category added successfully!");
      }
      setForm({ name: "", img_url: "" });
      setImage(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error("Something went wrong while saving!");
      console.error("Error saving category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, img_url: cat.img_url || "" });
    setEditId(cat.id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      await deleteProductCategory(id);
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category.");
      console.error("Error deleting category:", err);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page to 1 on search
  };

  const clearForm = () => {
    setForm({ name: "", img_url: "" });
    setEditId(null);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const searchVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25
      }
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
      transition: {
        duration: 0.3
      }
    }
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const rowVariants = {
    hidden: { x: -50, opacity: 0, scale: 0.9 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: i * 0.1
      }
    }),
    hover: {
      scale: 1.02,
      x: 10,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    exit: {
      x: 100,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const formVariants = {
    hidden: { x: 100, opacity: 0, scale: 0.8 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const iconVariants = {
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const paginationVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <>
      <Header />
      <motion.div 
        className="p-4 sm:p-6 bg-gray-50 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center mb-2 bg-white p-3 shadow-md rounded-lg"
          variants={headerVariants}
        >
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
            >
              📦
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Category Manager
            </h2>
          </motion.div>
          
          <motion.div 
            className="relative w-full sm:w-80 mb-1"
            variants={searchVariants}
            whileFocus="focus"
          >
            <motion.div
              animate={{ 
                scale: searchQuery ? 1.1 : 1,
                rotate: searchQuery ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.5 }}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <Search className="h-5 w-5 text-gray-400" />
            </motion.div>
            <input
              type="text"
              placeholder="Search categories..."
              className="border p-2 pl-10 rounded-md w-full focus:outline-blue-500 transition-all duration-300"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Table Section */}
          <motion.div 
            className="lg:col-span-2 overflow-auto bg-white shadow-lg p-2 rounded-lg"
            variants={tableVariants}
          >
            <div className="bg-white shadow-md rounded-lg mb-4">
              <table className="min-w-full table-auto text-sm text-gray-700">
                <thead className="bg-blue-50 text-gray-800">
                  <tr>
                    <th className="px-2 py-3 border">S/N</th>
                    <th className="px-2 py-3 border">Image</th>
                    <th className="px-2 py-3 border">Name</th>
                    <th className="px-2 py-3 border">Created At</th>
                    <th className="px-2 py-3 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  <AnimatePresence mode="wait">
                    {paginatedCategories.map((cat, index) => (
                      <motion.tr
                        key={cat.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover="hover"
                        onHoverStart={() => setHoveredRow(cat.id)}
                        onHoverEnd={() => setHoveredRow(null)}
                        className="hover:bg-gray-100 border-t cursor-pointer"
                      >
                        <td className="px-4 text-[16px] py-3 border">
                          <motion.span
                            animate={{ 
                              scale: hoveredRow === cat.id ? 1.2 : 1,
                              color: hoveredRow === cat.id ? "#3b82f6" : "#374151"
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {(currentPage - 1) * pageSize + index + 1}
                          </motion.span>
                        </td>
                        <td className="px-4 py-3 border">
                          {cat.img_url ? (
                            <img src={cat.img_url} alt={cat.name} className="w-10 h-10 object-contain mx-auto" />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </td>
                        <td className="px-4 text-[16px] py-3 border">
                          <motion.div
                            className="flex items-center justify-center space-x-2"
                            animate={{ 
                              x: hoveredRow === cat.id ? 5 : 0
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              animate={{ 
                                rotate: hoveredRow === cat.id ? 360 : 0,
                                scale: hoveredRow === cat.id ? 1.2 : 1
                              }}
                              transition={{ duration: 0.6 }}
                            >
                              📦
                            </motion.div>
                            <span className="font-medium">{cat.name}</span>
                          </motion.div>
                        </td>
                        <td className="px-4 text-[16px] py-3 border">
                          {new Date(cat.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 text-[16px] py-3 border space-x-2">
                          <motion.button
                            onClick={() => handleEdit(cat)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md cursor-pointer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <motion.div variants={iconVariants} whileHover="hover">
                              <Edit size={16} />
                            </motion.div>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(cat.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md cursor-pointer"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <motion.div variants={iconVariants} whileHover="hover">
                              <Trash size={16} />
                            </motion.div>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <motion.div 
              className="flex justify-between items-center mt-4"
              variants={paginationVariants}
            >
              <motion.p 
                className="text-sm text-gray-600"
                animate={{ 
                  color: currentPage > 1 ? "#3b82f6" : "#6b7280"
                }}
              >
                Page {currentPage} of {totalPages} | Total: {filteredCategories.length}
              </motion.p>
              <div className="space-x-2">
                <motion.button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-4 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  }`}
                  variants={buttonVariants}
                  whileHover={currentPage > 1 ? "hover" : {}}
                  whileTap={currentPage > 1 ? "tap" : {}}
                >
                  Previous
                </motion.button>
                <motion.button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  }`}
                  variants={buttonVariants}
                  whileHover={currentPage < totalPages ? "hover" : {}}
                  whileTap={currentPage < totalPages ? "tap" : {}}
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            className="bg-white shadow-lg rounded-md p-4 md:p-6 h-fit"
            variants={formVariants}
            whileHover="hover"
          >
            <motion.div
              className="flex items-center justify-between mb-4"
              animate={{ 
                x: editId ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 cursor-pointer flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    rotate: editId ? 360 : 0,
                    scale: editId ? 1.2 : 1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {editId ? "✏️" : "➕"}
                </motion.div>
                <span>{editId ? "Edit Category" : "Add New Category"}</span>
              </h3>
              {editId && (
                <motion.button
                  onClick={clearForm}
                  className="text-gray-500 hover:text-red-500 p-1 rounded-full"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              )}
            </motion.div>
            
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <motion.div className="mb-4" whileFocus={{ scale: 1.02 }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  className="border p-2 rounded-md w-full focus:outline-blue-500 transition-all duration-300"
                  value={form.name}
                  onChange={handleChange}
                />
              </motion.div>
              <motion.div className="mb-4" whileFocus={{ scale: 1.02 }}>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="border p-2 rounded-md w-full focus:outline-blue-500 transition-all duration-300"
                  onChange={handleImageChange}
                />
                {/* Image preview for edit mode */}
                {editId && form.img_url && (
                  <img src={form.img_url} alt="Category" className="mt-2 w-24 h-24 object-cover rounded" />
                )}
              </motion.div>
              <motion.button
                type="submit"
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-6 py-2 rounded-md w-full flex items-center justify-center space-x-2"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
              >
                <motion.div
                  animate={{ 
                    rotate: isLoading ? 360 : 0,
                    scale: isLoading ? 1.2 : 1
                  }}
                  transition={{ 
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" }
                  }}
                >
                  {isLoading ? <Package size={20} /> : <Save size={20} />}
                </motion.div>
                <span>
                  {isLoading ? "Saving..." : (editId ? "Update Category" : "Save Category")}
                </span>
              </motion.button>
            </form>

            {/* Stats Card */}
            <motion.div
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Categories</p>
                  <p className="text-2xl font-bold text-blue-800">{categories.length}</p>
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-3xl"
                >
                  📊
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default Category;
