// src/api/userApi.js
import axiosInstance from './axiosConfig';

// Get user's purchased tickets
export const getMyTickets = () => {
    return axiosInstance.get('/tickets/my-tickets');
};

// Get user's upcoming tickets
export const getMyUpcomingTickets = () => {
    return axiosInstance.get('/tickets/my-upcoming-tickets');
};

// Get user's listings
export const getMyListings = () => {
    return axiosInstance.get('/listings/my-listings');
};

// Get user's purchases
export const getMyPurchases = () => {
    return axiosInstance.get('/transactions/my-purchases');
};

// Get user's sales
export const getMySales = () => {
    return axiosInstance.get('/transactions/my-sales');
};

// Get total purchases amount
export const getMyTotalPurchases = () => {
    return axiosInstance.get('/transactions/my-total-purchases');
};

// Get total sales amount
export const getMyTotalSales = () => {
    return axiosInstance.get('/transactions/my-total-sales');
};