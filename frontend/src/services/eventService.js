// src/services/eventService.js
import axiosInstance from '../api/axiosConfig';

const API_URL = '/events';

// Get events with pagination
export const getEvents = async (page = 0, size = 10, sortBy = 'eventDate', direction = 'asc') => {
    try {
        const response = await axiosInstance.get(`${API_URL}/page?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        return { content: [], totalPages: 0, totalElements: 0 };
    }
};

// Get all events without pagination
export const getAllEvents = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching all events:', error);
        return [];
    }
};

// Get event by ID
export const getEventById = async (id) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching event with ID ${id}:`, error);
        return null;
    }
};

// Get upcoming events
export const getUpcomingEvents = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/upcoming`);
        return response.data;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
    }
};

// Get events with available tickets
export const getEventsWithAvailableTickets = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/available`);
        return response.data;
    } catch (error) {
        console.error('Error fetching events with available tickets:', error);
        return [];
    }
};

// Get events by type
export const getEventsByType = async (type) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/type/${type}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching events of type ${type}:`, error);
        return [];
    }
};

// Search events by name
export const searchEvents = async (name) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/search?name=${encodeURIComponent(name)}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching events with name ${name}:`, error);
        return [];
    }
};

// Get events by city
export const getEventsByCity = async (city) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/city/${encodeURIComponent(city)}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching events in city ${city}:`, error);
        return [];
    }
};

// Create a new event (requires admin role)
export const createEvent = async (eventData) => {
    try {
        const response = await axiosInstance.post(API_URL, eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Update an event (requires admin role)
export const updateEvent = async (id, eventData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/${id}`, eventData);
        return response.data;
    } catch (error) {
        console.error(`Error updating event with ID ${id}:`, error);
        throw error;
    }
};

// Get sample event data for testing/demo
export const getSampleEventData = () => {
    return [
        {
            id: 1,
            name: "Summer Music Festival",
            description: "A fantastic summer festival featuring top artists",
            eventDate: "2025-07-15T18:00:00",
            imageUrl: "https://placehold.co/600x400?text=Summer+Festival",
            venue: { name: "Central Park", city: "New York" },
            eventType: "CONCERT",
            availableTickets: 250,
            totalTickets: 1000,
            status: "SCHEDULED"
        },
        {
            id: 2,
            name: "Basketball Championship",
            description: "The final championship game of the season",
            eventDate: "2025-06-20T19:30:00",
            imageUrl: "https://placehold.co/600x400?text=Basketball+Game",
            venue: { name: "Sports Arena", city: "Los Angeles" },
            eventType: "SPORTS",
            availableTickets: 120,
            totalTickets: 800,
            status: "SCHEDULED"
        },
        {
            id: 3,
            name: "Broadway Musical",
            description: "Award-winning broadway show",
            eventDate: "2025-08-05T20:00:00",
            imageUrl: "https://placehold.co/600x400?text=Broadway+Show",
            venue: { name: "Theater District", city: "New York" },
            eventType: "THEATER",
            availableTickets: 75,
            totalTickets: 500,
            status: "SCHEDULED"
        }
    ];
};

// Export service object
export default {
    getEvents,
    getAllEvents,
    getEventById,
    getUpcomingEvents,
    getEventsWithAvailableTickets,
    getEventsByType,
    searchEvents,
    getEventsByCity,
    createEvent,
    updateEvent,
    getSampleEventData
};