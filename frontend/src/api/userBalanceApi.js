// frontend/src/api/userBalanceApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/balance';

// Get current user balance
export const getCurrentBalance = () => {
    return axiosInstance.get(`${API_URL}/current`);
};

// Get balance history
export const getBalanceHistory = () => {
    return axiosInstance.get(`${API_URL}/history`);
};

// Use balance for payment
export const useBalance = (amount, description, referenceType = null, referenceId = null) => {
    return axiosInstance.post(`${API_URL}/use`, null, {
        params: {
            amount,
            description,
            referenceType,
            referenceId
        }
    });
};

// Check if user can use balance
export const canUseBalance = (amount) => {
    return getCurrentBalance().then(response => {
        const currentBalance = response.data?.balance || 0;
        return currentBalance >= amount;
    });
};
