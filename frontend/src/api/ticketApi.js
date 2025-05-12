// src/api/ticketApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/tickets';

// Purchase a ticket
export const purchaseTicket = (ticketId) => {
    return axiosInstance.post(`${API_URL}/${ticketId}/purchase`);
};

// Get tickets by event
export const getTicketsByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}`);
};