// src/api/adminApi.js
import axiosInstance from './axiosConfig';

// Event management
export const getAllEvents = (page = 0, size = 10) => {
    return axiosInstance.get(`/events/page?page=${page}&size=${size}`);
};

export const getEventById = (id) => {
    return axiosInstance.get(`/events/${id}`);
};

export const createEvent = (eventData) => {
    return axiosInstance.post('/events', eventData);
};

export const updateEvent = (id, eventData) => {
    return axiosInstance.put(`/events/${id}`, eventData);
};

export const deleteEvent = (id) => {
    return axiosInstance.delete(`/events/${id}`);
};

export const changeEventStatus = (id, status) => {
    return axiosInstance.put(`/events/${id}/status?status=${status}`);
};

// Venue management
export const getAllVenues = () => {
    return axiosInstance.get('/venues');
};

export const getTicketQRCode = (id) => {
    return axiosInstance.get(`/tickets/${id}/qrcode`);
};

export const getVenueById = (id) => {
    return axiosInstance.get(`/venues/${id}`);
};

export const createVenue = (venueData) => {
    return axiosInstance.post('/venues', venueData);
};

export const updateVenue = (id, venueData) => {
    return axiosInstance.put(`/venues/${id}`, venueData);
};

export const deleteVenue = (id) => {
    return axiosInstance.delete(`/venues/${id}`);
};

// User management
export const getAllUsers = () => {
    return axiosInstance.get('/users');
};

export const getUserById = (id) => {
    return axiosInstance.get(`/users/${id}`);
};

export const createUser = (userData) => {
    return axiosInstance.post('/users', userData);
};

export const updateUser = (id, userData) => {
    return axiosInstance.put(`/users/${id}`, userData);
};

export const deleteUser = (id) => {
    return axiosInstance.delete(`/users/${id}`);
};

export const enableUser = (id) => {
    return axiosInstance.post(`/users/${id}/enable`);
};

export const disableUser = (id) => {
    return axiosInstance.post(`/users/${id}/disable`);
};

export const addRoleToUser = (userId, role) => {
    return axiosInstance.post(`/users/${userId}/roles/add/${role}`);
};

export const removeRoleFromUser = (userId, role) => {
    return axiosInstance.post(`/users/${userId}/roles/remove/${role}`);
};

// Ticket management
export const getAllTickets = () => {
    return axiosInstance.get('/tickets');
};

export const getTicketById = (id) => {
    return axiosInstance.get(`/tickets/${id}`);
};

export const createTicket = (ticketData) => {
    return axiosInstance.post('/tickets', ticketData);
};

export const updateTicket = (id, ticketData) => {
    return axiosInstance.put(`/tickets/${id}`, ticketData);
};

export const deleteTicket = (id) => {
    return axiosInstance.delete(`/tickets/${id}`);
};

export const updateTicketStatus = (id, status) => {
    return axiosInstance.put(`/tickets/${id}/status?status=${status}`);
};

export const generateBatchTickets = (eventId, pricingTierId, quantity, options = {}) => {
    return axiosInstance.post(`/tickets/batch`, null, {
        params: {
            eventId,
            pricingTierId,
            quantity,
            ...options
        }
    });
};

// Transaction management
export const getAllTransactions = () => {
    return axiosInstance.get('/transactions');
};

export const getTransactionById = (id) => {
    return axiosInstance.get(`/transactions/${id}`);
};

export const updateTransactionStatus = (id, status) => {
    return axiosInstance.put(`/transactions/${id}/status?status=${status}`);
};

export const refundTransaction = (id, reason) => {
    return axiosInstance.post(`/transactions/${id}/refund?reason=${encodeURIComponent(reason)}`);
};

export const getTransactionsByDateRange = (startDate, endDate) => {
    return axiosInstance.get(`/transactions/date-range?startDate=${startDate}&endDate=${endDate}`);
};

// Pricing Tier management
export const getAllPricingTiers = () => {
    return axiosInstance.get('/pricing-tiers');
};

export const getPricingTierById = (id) => {
    return axiosInstance.get(`/pricing-tiers/${id}`);
};

export const getPricingTiersByEvent = (eventId) => {
    return axiosInstance.get(`/pricing-tiers/event/${eventId}`);
};

export const createPricingTier = (tierData) => {
    return axiosInstance.post('/pricing-tiers', tierData);
};

export const updatePricingTier = (id, tierData) => {
    return axiosInstance.put(`/pricing-tiers/${id}`, tierData);
};

export const deletePricingTier = (id) => {
    return axiosInstance.delete(`/pricing-tiers/${id}`);
};

// Dashboard statistics
export const getDashboardStats = () => {
    return axiosInstance.get('/admin/dashboard/stats');
};