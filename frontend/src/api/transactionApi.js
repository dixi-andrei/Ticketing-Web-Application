// frontend/src/api/transactionApi.js - Updated with balance payment support
import axiosInstance from './axiosConfig';

const API_URL = '/transactions';

// Get all transactions
export const getAllTransactions = () => {
    return axiosInstance.get(API_URL);
};

// Get transaction by ID
export const getTransactionById = (id) => {
    return axiosInstance.get(`${API_URL}/${id}`);
};

// Get transaction by number
export const getTransactionByNumber = (transactionNumber) => {
    return axiosInstance.get(`${API_URL}/number/${transactionNumber}`);
};

// Get transactions by buyer
export const getTransactionsByBuyer = (buyerId) => {
    return axiosInstance.get(`${API_URL}/buyer/${buyerId}`);
};

// Get transactions by seller
export const getTransactionsBySeller = (sellerId) => {
    return axiosInstance.get(`${API_URL}/seller/${sellerId}`);
};

// Get transactions by date range
export const getTransactionsByDateRange = (startDate, endDate) => {
    return axiosInstance.get(`${API_URL}/date-range?startDate=${startDate}&endDate=${endDate}`);
};

// Create a new transaction
export const createTransaction = (transactionData) => {
    return axiosInstance.post(API_URL, transactionData);
};

// Update transaction status
export const updateTransactionStatus = (id, status) => {
    return axiosInstance.put(`${API_URL}/${id}/status?status=${status}`);
};

// Process payment with credit card
export const processPayment = (transactionId, paymentMethod, paymentDetails = null) => {
    return axiosInstance.post(
        `${API_URL}/${transactionId}/process-payment?paymentMethod=${paymentMethod}${
            paymentDetails ? `&paymentDetails=${paymentDetails}` : ''
        }`
    );
};

// Process payment with account balance
export const processPaymentWithBalance = (transactionId) => {
    return axiosInstance.post(`${API_URL}/${transactionId}/pay-with-balance`);
};

// Refund transaction
export const refundTransaction = (transactionId, reason) => {
    return axiosInstance.post(`${API_URL}/${transactionId}/refund?reason=${encodeURIComponent(reason)}`);
};

// Get total sales by user
export const getTotalSalesByUser = (userId) => {
    return axiosInstance.get(`${API_URL}/user/${userId}/total-sales`);
};

// Get total purchases by user
export const getTotalPurchasesByUser = (userId) => {
    return axiosInstance.get(`${API_URL}/user/${userId}/total-purchases`);
};

// For the current user
export const getMyPurchases = () => {
    return axiosInstance.get(`${API_URL}/my-purchases`);
};

export const getMySales = () => {
    return axiosInstance.get(`${API_URL}/my-sales`);
};

export const getMyTotalPurchases = () => {
    return axiosInstance.get(`${API_URL}/my-total-purchases`);
};

export const getMyTotalSales = () => {
    return axiosInstance.get(`${API_URL}/my-total-sales`);
};

// Create a ticket purchase transaction with payment method choice
export const createTicketPurchaseTransaction = (ticketId, paymentMethod = 'card') => {
    return axiosInstance.post(`${API_URL}/purchase-ticket`, {
        ticketId,
        paymentMethod
    });
};

// Create a listing purchase transaction with payment method choice
export const createListingPurchaseTransaction = (listingId, paymentMethod = 'card') => {
    return axiosInstance.post(`${API_URL}/purchase-listing`, {
        listingId,
        paymentMethod
    });
};