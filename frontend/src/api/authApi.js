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