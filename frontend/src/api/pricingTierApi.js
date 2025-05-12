// src/api/pricingTierApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/pricing-tiers';

// Get pricing tiers by event ID
export const getPricingTiersByEvent = (eventId) => {
    return axiosInstance.get(`${API_URL}/event/${eventId}`);
};