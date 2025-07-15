import React, { createContext, useState, useCallback, useEffect } from 'react';
import { getAdminUsers, getAllProducts, getAllRetailers, getProductCategories } from '../api';

export const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [retailerCount, setRetailerCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [pieData, setPieData] = useState(null);
  const [userStatusPie, setUserStatusPie] = useState(null);
  const [retailerStatusPie, setRetailerStatusPie] = useState(null);
  const [combinedStatusPie, setCombinedStatusPie] = useState(null);
  const [lineChartLabels, setLineChartLabels] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]);
  const [lineChartData, setLineChartData] = useState([]);
  const [areaChartLabels, setAreaChartLabels] = useState([
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]);
  const [areaChartData, setAreaChartData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentRetailers, setRecentRetailers] = useState([]);

  const fetchRecentUsers = useCallback(() => {
    getAdminUsers().then(res => {
      const users = Array.isArray(res.data.data) ? res.data.data : res.data?.data || [];
      setUserCount(users.length);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const monthlyCounts = Array(12).fill(0);
      let hasCreatedAt = false;
      users.forEach(user => {
        if (user.created_at) {
          hasCreatedAt = true;
          const date = new Date(user.created_at);
          const month = date.getMonth();
          monthlyCounts[month]++;
        }
      });
      if (hasCreatedAt) {
        setLineChartLabels(months);
        setLineChartData(monthlyCounts);
        setAreaChartLabels(months);
        setAreaChartData(monthlyCounts.map(v => v + 2));
      } else {
        setLineChartLabels(months);
        setLineChartData([]);
        setAreaChartLabels(months);
        setAreaChartData([]);
      }
      const active = users.filter(u => (u.status || '').toLowerCase() === 'active').length;
      const inactive = users.filter(u => (u.status || '').toLowerCase() === 'inactive').length;
      setUserStatusPie({
        labels: ['Active', 'Inactive'],
        datasets: [{
          label: 'User Status',
          data: [active, inactive],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        }],
      });
      window._usersForPie = { usersActive: active, usersInactive: inactive };
      setRecentUsers(users.slice(-5));
    }).catch(() => setUserCount(0));
  }, []);

  const fetchRecentProducts = useCallback(() => {
    getAllProducts().then(res => {
      const products = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProductCount(products.length);
      const productsActive = products.filter(p => (p.status || '').toLowerCase() === 'available').length;
      const productsInactive = products.filter(p => (p.status || '').toLowerCase() === 'unavailable').length;
      getProductCategories().then(res2 => {
        const categories = Array.isArray(res2.data) ? res2.data : res2.data?.data || [];
        setCategoryCount(categories.length);
        setCategories(categories);
        const categoryNames = categories.map(cat => cat.name);
        const productCounts = categories.map(cat =>
          products.filter(p => String(p.category_id) === String(cat.id)).length
        );
        setPieData({
          labels: categoryNames,
          datasets: [
            {
              label: 'Products per Category',
              data: productCounts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(199, 199, 199, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
        if (window._retailersForPie && window._usersForPie) {
          const { active: retailersActive, inactive: retailersInactive } = window._retailersForPie;
          const { usersActive, usersInactive } = window._usersForPie;
          setCombinedStatusPie({
            labels: [
              'Retailers Active',
              'Retailers Inactive',
              'Products Active',
              'Products Inactive',
              'Users Active',
              'Users Inactive',
            ],
            datasets: [
              {
                label: 'Retailers, Products & Users Status',
                data: [
                  retailersActive,
                  retailersInactive,
                  productsActive,
                  productsInactive,
                  usersActive,
                  usersInactive,
                ],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 159, 64, 0.8)',
                  'rgba(0, 128, 0, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(255, 99, 132, 0.8)',
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(0, 128, 0, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
              },
            ],
          });
        } else {
          window._productsForPie = { productsActive, productsInactive };
        }
      });
      setRecentProducts(products.slice(-5));
    }).catch(() => setProductCount(0));
  }, []);

  const fetchRecentRetailers = useCallback(() => {
    getAllRetailers().then(res => {
      const retailers = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRetailerCount(retailers.length);
      const retailersActive = retailers.filter(r => (r.status || '').toLowerCase() === 'active').length;
      const retailersInactive = retailers.filter(r => (r.status || '').toLowerCase() === 'inactive').length;
      setRetailerStatusPie({
        labels: ['Active', 'Inactive'],
        datasets: [{
          label: 'Retailer Status',
          data: [retailersActive, retailersInactive],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        }],
      });
      if (window._productsForPie && window._usersForPie) {
        const { productsActive, productsInactive } = window._productsForPie;
        const { usersActive, usersInactive } = window._usersForPie;
        setCombinedStatusPie({
          labels: [
            'Retailers Active',
            'Retailers Inactive',
            'Products Active',
            'Products Inactive',
            'Users Active',
            'Users Inactive',
          ],
          datasets: [
            {
              label: 'Retailers, Products & Users Status',
              data: [
                retailersActive,
                retailersInactive,
                productsActive,
                productsInactive,
                usersActive,
                usersInactive,
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(0, 128, 0, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(255, 99, 132, 0.8)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(0, 128, 0, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      } else {
        window._retailersForPie = { active: retailersActive, inactive: retailersInactive };
      }
      setRecentRetailers(retailers.slice(-5));
    }).catch(() => setRetailerCount(0));
  }, []);

  useEffect(() => {
    fetchRecentUsers();
    fetchRecentProducts();
    fetchRecentRetailers();
  }, [fetchRecentUsers, fetchRecentProducts, fetchRecentRetailers]);

  return (
    <DashboardContext.Provider value={{
      fetchRecentUsers,
      fetchRecentProducts,
      fetchRecentRetailers,
      recentUsers,
      recentProducts,
      recentRetailers,
      userCount,
      productCount,
      retailerCount,
      categoryCount,
      pieData,
      userStatusPie,
      retailerStatusPie,
      combinedStatusPie,
      lineChartLabels,
      lineChartData,
      areaChartLabels,
      areaChartData,
    }}>
      {children}
    </DashboardContext.Provider>
  );
} 