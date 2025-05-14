// src/api/ticketApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/tickets';

// Get all tickets
export const getAllTickets = () => {
    return axiosInstance.get(API_URL);
};

// Get ticket by ID
export const getTicketById = (id) => {
    return axiosInstance.get(`${API_URL}/${id}`);
};

// Get ticket by number
export const getTicketByNumber = (ticketNumber) => {
    return axiosInstance.get(`${API_URL}/number/${ticketNumber}`);
};

// Get tickets by event
export const getTicketsByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}`);
};

// Purchase a ticket
export const purchaseTicket = (ticketId) => {
    return axiosInstance.post(`${API_URL}/${ticketId}/purchase`);
};

// Create a new ticket
export const createTicket = (ticketData) => {
    return axiosInstance.post(API_URL, ticketData);
};

// Update a ticket
export const updateTicket = (id, ticketData) => {
    return axiosInstance.put(`${API_URL}/${id}`, ticketData);
};

// Update ticket status
export const updateTicketStatus = (id, status) => {
    return axiosInstance.put(`${API_URL}/${id}/status?status=${status}`);
};

// Delete a ticket
export const deleteTicket = (id) => {
    return axiosInstance.delete(`${API_URL}/${id}`);
};

// Get QR code for a ticket
export const getTicketQRCode = (id) => {
    return axiosInstance.get(`${API_URL}/${id}/qrcode`);
};

// Validate a ticket
export const validateTicket = (ticketNumber) => {
    return axiosInstance.post(`${API_URL}/validate?ticketNumber=${ticketNumber}`);
};

// Mark ticket as used
export const markTicketAsUsed = (id) => {
    return axiosInstance.post(`${API_URL}/${id}/use`);
};

// Generate batch tickets
export const generateBatchTickets = (eventId, pricingTierId, quantity, options = {}) => {
    return axiosInstance.post(`${API_URL}/batch`, null, {
        params: {
            eventId,
            pricingTierId,
            quantity,
            ...options
        }
    });
};