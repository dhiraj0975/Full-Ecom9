import http from './httpClient';

export const getAddressesByCustomer = (customerId) => http.get(`/customer-addresses/customer/${customerId}`);
export const getAddressById = (id) => http.get(`/customer-addresses/${id}`);
export const createAddress = (data) => http.post('/customer-addresses', data);
export const updateAddress = (id, data) => http.put(`/customer-addresses/${id}`, data);
export const deleteAddress = (id) => http.delete(`/customer-addresses/${id}`);
export const setDefaultAddress = (id) => http.patch(`/customer-addresses/${id}/default`); 