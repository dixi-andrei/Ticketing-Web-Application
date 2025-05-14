// src/services/ticketService.js
import axiosInstance from '../api/axiosConfig';

const API_URL = '/tickets';

// Get all tickets
export const getAllTickets = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        return getMockTickets();
    }
};

// Get ticket by ID
export const getTicketById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ticket with ID ${id}:`, error);
        return null;
    }
};

// Get ticket by number
export const getTicketByNumber = async (ticketNumber) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/number/${ticketNumber}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ticket with number ${ticketNumber}:`, error);
        return null;
    }
};

// Get tickets by event
export const getTicketsByEvent = async (eventId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/event/${eventId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching tickets for event with ID ${eventId}:`, error);
        return [];
    }
};

// Get user's tickets
export const getMyTickets = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/my-tickets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching my tickets:', error);
        return getMockTickets();
    }
};

// Get user's upcoming tickets
export const getMyUpcomingTickets = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/my-upcoming-tickets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching my upcoming tickets:', error);
        return getMockTickets();
    }
};

// Purchase a ticket
export const purchaseTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/${ticketId}/purchase`);
        return response.data;
    } catch (error) {
        console.error(`Error purchasing ticket with ID ${ticketId}:`, error);
        throw error;
    }
};

// Get QR code for a ticket
export const getTicketQRCode = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${id}/qrcode`);
        return response.data;
    } catch (error) {
        console.error(`Error getting QR code for ticket with ID ${id}:`, error);
        return { qrCode: 'MOCK_QR_CODE_DATA' };
    }
};

// Validate a ticket
export const validateTicket = async (ticketNumber) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/validate?ticketNumber=${ticketNumber}`);
        return response.data;
    } catch (error) {
        console.error(`Error validating ticket with number ${ticketNumber}:`, error);
        return { valid: false };
    }
};

// Generate batch tickets (admin only)
export const generateBatchTickets = async (eventId, pricingTierId, quantity, options = {}) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/batch`, null, {
            params: {
                eventId,
                pricingTierId,
                quantity,
                ...options
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error generating batch tickets:', error);
        throw error;
    }
};

// Mock data for development/testing
export const getMockTickets = () => {
    return [
        {
            id: 1,
            ticketNumber: "TKT-12345",
            originalPrice: 150.00,
            currentPrice: 150.00,
            section: "A",
            row: "5",
            seat: "23",
            status: "PURCHASED",
            purchaseDate: "2025-05-05T14:30:00",
            qrCodeUrl: "MOCK_QR_CODE",
            event: {
                id: 1,
                name: "Summer Music Festival",
                eventDate: "2025-07-15T18:00:00",
                venue: {
                    name: "Central Park",
                    city: "New York"
                }
            },
            owner: {
                id: 1,
                firstName: "John",
                lastName: "Doe"
            }
        },
        {
            id: 2,
            ticketNumber: "TKT-67890",
            originalPrice: 100.00,
            currentPrice: 100.00,
            section: "B",
            row: "10",
            seat: "15",
            status: "PURCHASED",
            purchaseDate: "2025-05-10T09:15:00",
            qrCodeUrl: "MOCK_QR_CODE",
            event: {
                id: 2,
                name: "Basketball Championship",
                eventDate: "2025-06-20T19:30:00",
                venue: {
                    name: "Sports Arena",
                    city: "Los Angeles"
                }
            },
            owner: {
                id: 1,
                firstName: "John",
                lastName: "Doe"
            }
        }
    ];
};

export default {
    getAllTickets,
    getTicketById,
    getTicketByNumber,
    getTicketsByEvent,
    getMyTickets,
    getMyUpcomingTickets,
    purchaseTicket,
    getTicketQRCode,
    validateTicket,
    generateBatchTickets,
    getMockTickets
};