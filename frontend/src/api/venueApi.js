// src/api/venueApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/venues';

// Get all venues
export const getAllVenues = () => {
    return axiosInstance.get(API_URL);
};

// Get venue by ID
export const getVenueById = (id) => {
    return axiosInstance.get(`${API_URL}/${id}`);
};

// Get venues by city
export const getVenuesByCity = (city) => {
    return axiosInstance.get(`${API_URL}/city/${encodeURIComponent(city)}`);
};

// Search venues by name
export const searchVenuesByName = (name) => {
    return axiosInstance.get(`${API_URL}/search?name=${encodeURIComponent(name)}`);
};

// Create a new venue
export const createVenue = (venueData) => {
    return axiosInstance.post(API_URL, venueData);
};

// Update a venue
export const updateVenue = (id, venueData) => {
    return axiosInstance.put(`${API_URL}/${id}`, venueData);
};

// Delete a venue
export const deleteVenue = (id) => {
    return axiosInstance.delete(`${API_URL}/${id}`);
};