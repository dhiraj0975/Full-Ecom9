import React, { useEffect, useState, useRef } from 'react';
import { fetchCategories } from '../../services/categoryService';
import { fetchSubcategories } from '../../services/subcategoryService';
import { ShoppingBag, Monitor, Shirt, Gift, Home, Book, Trophy, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

// Category name to icon mapping
const iconMap = {
  'Grocery': ShoppingBag,
  'Electronics': Monitor,
  'Fashion': Shirt,
  'Beauty & Personal Care': Gift,
  'Home & Kitchen': Home,
  'Books': Book,
  'Sports & Outdoors': Trophy,
  'Toys & Games': Gift,
  'Mobile & Accessories': Smartphone,
  'Furniture': Home,
  // Default
  'default': ShoppingBag,
};

// Category name to unique hover text mapping
const hoverTextMap = {
  'Grocery': 'Shop fresh groceries',
  'Electronics': 'Explore latest gadgets',
  'Fashion': 'Discover new trends',
  'Beauty & Personal Care': 'Pamper yourself',
  'Home & Kitchen': 'Upgrade your home',
  'Books': 'Read and grow',
  'Sports & Outdoors': 'Get active!',
  'Toys & Games': 'Fun for everyone',
  'Mobile & Accessories': 'Stay connected',
  'Furniture': 'Furnish your space',
  // Default
  'default': 'Explore this category',
};

const catBtnVariants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.08)',
    background: 'white',
  },
  hover: {
    scale: 1.10,
    y: -6,
    boxShadow: '0 8px 24px 0 rgba(59,130,246,0.15)',
    background: 'white',
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
  tap: {
    scale: 1.06,
    y: -2,
    boxShadow: '0 4px 16px 0 rgba(59,130,246,0.12)',
    background: 'white',
  },
};

const iconVariants = {
  initial: { scale: 1, color: '#2563eb' },
  hover: { scale: 1.18, color: '#2563eb', transition: { type: 'spring', stiffness: 400 } },
  tap: { scale: 1.12, color: '#2563eb' },
};

const CategoryBar = ({ showIcons }) => {
  const [categories, setCategories] = useState([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHover, setDrawerHover] = useState(false);
  const [drawerPos, setDrawerPos] = useState({ left: 0, top: 0 });
  const drawerRef = useRef(null);
  const btnRefs = useRef({});
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const labelVariants = isHome
    ? {
        initial: { color: '#334155' },
        hover: { color: '#fff', transition: { duration: 0.2 } },
        tap: { color: '#fff' },
      }
    : {
        initial: { color: '#334155' },
        hover: { color: '#334155', transition: { duration: 0.2 } },
        tap: { color: '#334155' },
      };

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Fetch subcategories when hoveredCategoryId or activeCategoryId changes
  useEffect(() => {
    const catId = hoveredCategoryId || activeCategoryId;
    if (catId) {
      fetchSubcategories(catId).then(data => {
        setSubcategories(data);
        // Set drawer position
        const btn = btnRefs.current[catId];
        if (btn) {
          const rect = btn.getBoundingClientRect();
          setDrawerPos({
            left: rect.left + rect.width / 2,
            top: rect.bottom + window.scrollY + 5,
          });
        }
      });
      setDrawerOpen(true);
    } else if (!drawerHover) {
      setDrawerOpen(false);
      setSubcategories([]);
    }
  }, [hoveredCategoryId, activeCategoryId, drawerHover]);

  // Drawer close delay for smooth UX (hover)
  const handleCategoryLeave = () => {
    setTimeout(() => {
      if (!drawerHover && !activeCategoryId) {
        setDrawerOpen(false);
        setHoveredCategoryId(null);
        setSubcategories([]);
      }
    }, 120);
  };

  // Close drawer on outside click (for hover/click open)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.classList.contains('category-bar-btn')
      ) {
        setActiveCategoryId(null);
        setHoveredCategoryId(null);
        setDrawerOpen(false);
        setSubcategories([]);
      }
    }
    if (drawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  return (
    <div className={`w-full ${isHome ? 'h-24' : 'h-14'} bg-white ${isHome ? 'mt-2' : ''} mx-2 shadow-sm border-b border-gray-100 relative z-30 overflow-hidden`}>
      <div className={`flex w-full ${isHome ? 'justify-center' : 'justify-center items-center'}`} style={{height: isHome ? undefined : '56px'}}>
        <div className={`max-w-7xl ${isHome ? 'w-full' : 'w-auto'} px-0 sm:px-2 md:px-6 flex ${isHome ? 'overflow-x-auto items-center category-bar-no-scroll' : 'overflow-x-auto whitespace-nowrap items-center category-bar-no-scroll mx-auto'} `} style={{height: isHome ? '80px' : '56px', minHeight: isHome ? '80px' : '56px', width: isHome ? undefined : 'fit-content', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', overflowY: 'visible'}}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id || cat.name}
              ref={el => (btnRefs.current[cat.id] = el)}
              variants={catBtnVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onMouseEnter={() => setHoveredCategoryId(cat.id)}
              onMouseLeave={handleCategoryLeave}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`category-bar-btn select-none touch-manipulation transition flex items-center justify-center ${isHome ? 'flex-col min-w-[80px] sm:min-w-[100px] py-2 mx-1 sm:mx-2 rounded-xl shadow-sm' : 'min-w-fit py-2 px-3 mx-1 bg-white rounded-none shadow-none'} ${categories.length > 0 && idx === categories.length-1 ? 'mr-3 sm:mr-6' : ''}`}
              style={{ background: 'white', zIndex: hoveredCategoryId === cat.id ? 30 : 10, boxShadow: isHome && hoveredCategoryId === cat.id ? '0 8px 32px 0 rgba(59,130,246,0.18)' : undefined }}
            >
              {isHome ? (
                <>
                  {cat.img_url ? (
                    <img
                      src={cat.img_url}
                      alt={cat.name}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-full border border-gray-200 bg-white shadow"
                      style={{ minWidth: '56px', minHeight: '56px', maxWidth: '64px', maxHeight: '64px' }}
                    />
                  ) : (
                    <div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center bg-gray-200 rounded-full text-xs text-gray-500 shadow mt-2"
                      style={{ minWidth: '56px', minHeight: '56px', maxWidth: '64px', maxHeight: '64px' }}>
                      Img
                    </div>
                  )}
                  <motion.span
                    variants={labelVariants}
                    className={`block mt-2 text-[10px] sm:text-xs font-semibold text-black text-center whitespace-nowrap overflow-hidden text-ellipsis`}
                    style={{ maxWidth: '96px', lineHeight: '1.1', background: 'white' }}
                    title={cat.name}
                  >
                    {cat.name}
                  </motion.span>
                </>
              ) : (
                <span className="font-semibold text-black text-[13px] text-center whitespace-nowrap px-1" title={cat.name}>{cat.name}</span>
              )}
            </motion.div>
          ))}
          {/* Hide scrollbar for Webkit browsers */}
          <style>{`
            .category-bar-no-scroll::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
      </div>
      {/* Drawer rendered at page level, fixed position */}
      <AnimatePresence>
        {drawerOpen && subcategories.length > 0 && (
          <motion.div
            ref={drawerRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, type: 'spring' }}
            onMouseEnter={() => setDrawerHover(true)}
            onMouseLeave={() => { setDrawerHover(false); if (!activeCategoryId) { setDrawerOpen(false); setHoveredCategoryId(null); setSubcategories([]); } }}
            className="fixed z-[9999] font-sm bg-white shadow-3xl border border-gray-200 rounded-xl py-4 px-0 flex flex-col min-w-[220px]"
            style={{
              minHeight: '120px',
              maxHeight: '60vh',
              overflowY: 'auto',
              left: drawerPos.left,
              top: drawerPos.top,
              transform: 'translateX(-50%)',
              boxShadow: '0 12px 48px 0 rgba(59,130,246,0.25), 0 2px 24px 0 rgba(67,233,123,0.18)'
            }}
          >
            {subcategories.map((sub) => (
              <div
                key={sub.id}
                className="text-base font-medium text-gray-700 hover:bg-blue-50 px-6 py-2 cursor-pointer transition text-center"
                onClick={() => navigate(`/products/subcategory/${sub.id}`)}
              >
                {sub.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryBar; 