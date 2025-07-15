import http from './httpClient';

export const getCustomers = (params) => http.get('/customers', { params });
export const getCustomerById = (id) => http.get(`/customers/${id}`);
export const createCustomer = (data) => http.post('/customers', data);
export const addCustomer = createCustomer;
export const updateCustomer = (id, data) => http.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => http.delete(`/customers/${id}`);
export const getCustomersWithOrders = (params) => http.get('/customers/with-orders', { params }); 