// src/services/listingService.js
import axiosInstance from '../api/axiosConfig';

const API_URL = '/listings';

// Get all listings
export const getAllListings = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching all listings:', error);
        return getMockListings();
    }
};

// Get listing by ID
export const getListingById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching listing with ID ${id}:`, error);
        return null;
    }
};

// Get user's listings
export const getMyListings = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/my-listings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching my listings:', error);
        return getMockListings().slice(0, 1);
    }
};

// Get listings by event
export const getListingsByEvent = async (eventId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/event/${eventId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching listings for event with ID ${eventId}:`, error);
        return [];
    }
};

// Get cheapest listings by event
export const getCheapestListingsByEvent = async (eventId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/event/${eventId}/cheapest`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching cheapest listings for event with ID ${eventId}:`, error);
        return [];
    }
};

// Create a listing
export const createListing = async (ticketId, askingPrice, description = "") => {
    try {
        const response = await axiosInstance.post(`${API_URL}?ticketId=${ticketId}`, {
            askingPrice,
            description
        });
        return response.data;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

// Update a listing
export const updateListing = async (id, askingPrice, description = "") => {
    try {
        const response = await axiosInstance.put(`${API_URL}/${id}`, {
            askingPrice,
            description
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating listing with ID ${id}:`, error);
        throw error;
    }
};

// Cancel a listing
export const cancelListing = async (id) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/${id}/cancel`);
        return response.data;
    } catch (error) {
        console.error(`Error canceling listing with ID ${id}:`, error);
        throw error;
    }
};

// Purchase a listing
export const purchaseListing = async (id) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/${id}/purchase`);
        return response.data;
    } catch (error) {
        console.error(`Error purchasing listing with ID ${id}:`, error);
        throw error;
    }
};

// Get count of active listings by event
export const countActiveListingsByEvent = async (eventId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/event/${eventId}/count`);
        return response.data;
    } catch (error) {
        console.error(`Error counting active listings for event with ID ${eventId}:`, error);
        return { count: 0 };
    }
};

// Mock data for development/testing
export const getMockListings = () => {
    return [
        {
            id: 1,
            askingPrice: 75.00,
            description: "Can't make the event, selling at a discount",
            listingDate: "2025-05-10T14:30:00",
            status: "ACTIVE",
            ticket: {
                id: 101,
                ticketNumber: "TKT-12345",
                originalPrice: 85.00,
                section: "A",
                row: "10",
                seat: "15",
                event: {
                    id: 1,
                    name: "Summer Music Festival",
                    eventDate: "2025-07-15T18:00:00",
                    venue: {
                        name: "Central Park",
                        city: "New York"
                    }
                }
            },
            seller: {
                firstName: "John",
                lastName: "Doe"
            }
        },
        {
            id: 2,
            askingPrice: 120.00,
            description: "Great seat, but can't attend",
            listingDate: "2025-05-12T10:15:00",
            status: "ACTIVE",
            ticket: {
                id: 102,
                ticketNumber: "TKT-67890",
                originalPrice: 150.00,
                section: "VIP",
                row: "2",
                seat: "8",
                event: {
                    id: 2,
                    name: "Basketball Championship",
                    eventDate: "2025-06-20T19:30:00",
                    venue: {
                        name: "Sports Arena",
                        city: "Los Angeles"
                    }
                }
            },
            seller: {
                firstName: "Jane",
                lastName: "Smith"
            }
        },
        {
            id: 3,
            askingPrice: 45.00,
            description: "Selling at face value",
            listingDate: "2025-05-11T16:45:00",
            status: "ACTIVE",
            ticket: {
                id: 103,
                ticketNumber: "TKT-24680",
                originalPrice: 45.00,
                section: "B",
                row: "15",
                seat: "22",
                event: {
                    id: 3,
                    name: "Broadway Musical",
                    eventDate: "2025-08-05T20:00:00",
                    venue: {
                        name: "Theater District",
                        city: "New York"
                    }
                }
            },
            seller: {
                firstName: "Alex",
                lastName: "Johnson"
            }
        }
    ];
};

export default {
    getAllListings,
    getListingById,
    getMyListings,
    getListingsByEvent,
    getCheapestListingsByEvent,
    createListing,
    updateListing,
    cancelListing,
    purchaseListing,
    countActiveListingsByEvent,
    getMockListings
};