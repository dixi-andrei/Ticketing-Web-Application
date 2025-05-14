// src/api/pricingTierApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/pricing-tiers';

// Get all pricing tiers
export const getAllPricingTiers = () => {
    return axiosInstance.get(API_URL);
};

// Get pricing tier by ID
export const getPricingTierById = (id) => {
    return axiosInstance.get(`${API_URL}/${id}`);
};

// Get pricing tiers by event ID
export const getPricingTiersByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}`);
};

// Create a new pricing tier
export const createPricingTier = (pricingTierData) => {
    return axiosInstance.post(API_URL, pricingTierData);
};

// Update a pricing tier
export const updatePricingTier = (id, pricingTierData) => {
    return axiosInstance.put(`${API_URL}/${id}`, pricingTierData);
};

// Delete a pricing tier
export const deletePricingTier = (id) => {
    return axiosInstance.delete(`${API_URL}/${id}`);
};