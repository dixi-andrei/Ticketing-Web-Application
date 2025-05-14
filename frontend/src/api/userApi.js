// src/api/userApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/users';
const TICKETS_API = '/tickets';
const LISTINGS_API = '/listings';
const TRANSACTIONS_API = '/transactions';

// User management
export const getAllUsers = () => {
    return axiosInstance.get(API_URL);
};

export const getUserById = (id) => {
    return axiosInstance.get(`${API_URL}/${id}`);
};

export const getUserByEmail = (email) => {
    return axiosInstance.get(`${API_URL}/email/${encodeURIComponent(email)}`);
};

export const createUser = (userData) => {
    return axiosInstance.post(API_URL, userData);
};

export const updateUser = (id, userData) => {
    return axiosInstance.put(`${API_URL}/${id}`, userData);
};

export const deleteUser = (id) => {
    return axiosInstance.delete(`${API_URL}/${id}`);
};

export const getCurrentUserProfile = () => {
    return axiosInstance.get(`${API_URL}/profile`);
};

export const updateCurrentUserProfile = (userData) => {
    return axiosInstance.put(`${API_URL}/profile`, userData);
};

// User roles
export const addRoleToUser = (userId, role) => {
    return axiosInstance.post(`${API_URL}/${userId}/roles/add/${role}`);
};

export const removeRoleFromUser = (userId, role) => {
    return axiosInstance.post(`${API_URL}/${userId}/roles/remove/${role}`);
};

// User status
export const enableUser = (id) => {
    return axiosInstance.post(`${API_URL}/${id}/enable`);
};

export const disableUser = (id) => {
    return axiosInstance.post(`${API_URL}/${id}/disable`);
};

// User data
export const getUserTickets = (userId) => {
    return axiosInstance.get(`${API_URL}/${userId}/tickets`);
};

export const getUserEvents = (userId) => {
    return axiosInstance.get(`${API_URL}/${userId}/events`);
};

export const getUserTransactions = (userId) => {
    return axiosInstance.get(`${API_URL}/${userId}/transactions`);
};

// Current user data
export const getMyTickets = () => {
    return axiosInstance.get(`${TICKETS_API}/my-tickets`);
};

export const getMyUpcomingTickets = () => {
    return axiosInstance.get(`${TICKETS_API}/my-upcoming-tickets`);
};

export const getMyListings = () => {
    return axiosInstance.get(`${LISTINGS_API}/my-listings`);
};

export const getMyPurchases = () => {
    return axiosInstance.get(`${TRANSACTIONS_API}/my-purchases`);
};

export const getMySales = () => {
    return axiosInstance.get(`${TRANSACTIONS_API}/my-sales`);
};

export const getMyTotalPurchases = () => {
    return axiosInstance.get(`${TRANSACTIONS_API}/my-total-purchases`);
};

export const getMyTotalSales = () => {
    return axiosInstance.get(`${TRANSACTIONS_API}/my-total-sales`);
};