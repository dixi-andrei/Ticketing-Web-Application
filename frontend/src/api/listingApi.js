// src/api/listingApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/listings';

// Get all active listings
export const getAllListings = () => {
    return axiosInstance.get(API_URL);
};

// Create a new listing
export const createListing = (listingData) => {
    return axiosInstance.post(`${API_URL}?ticketId=${listingData.ticketId}`, {
        askingPrice: listingData.askingPrice,
        description: listingData.description
    });
};

// Get all listings by event
export const getListingsByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}`);
};

// Get cheapest listings by event
export const getCheapestListingsByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}/cheapest`);
};

// Cancel a listing
export const cancelListing = (listingId) => {
    return axiosInstance.post(`${API_URL}/${listingId}/cancel`);
};

// Purchase a listing
export const purchaseListing = (listingId) => {
    return axiosInstance.post(`${API_URL}/${listingId}/purchase`);
};