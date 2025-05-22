import axios from 'axios';
import API_BASE_URL from './config';

const API_URL = `${API_BASE_URL}/auth`;

// Register a new user
export const register = (email, password, firstName, lastName) => {
    return axios.post(`${API_URL}/signup`, {
        email,
        password,
        firstName,
        lastName
    });
};

// Login a user
export const login = (email, password) => {
    return axios.post(`${API_URL}/signin`, {
        email,
        password
    });
};

// Verify email with token
export const verifyEmail = (token) => {
    return axios.get(`${API_URL}/verify-email?token=${token}`);
};

// Resend verification email
export const resendVerification = (email) => {
    return axios.post(`${API_URL}/resend-verification?email=${email}`);
};

// Request password reset
export const forgotPassword = (email) => {
    return axios.post(`${API_URL}/forgot-password?email=${email}`);
};

// Reset password with token
export const resetPassword = (token, newPassword, confirmPassword) => {
    return axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword,
        confirmPassword
    });
};
