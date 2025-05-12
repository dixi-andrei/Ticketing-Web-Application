// src/api/eventApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/events';

// Get all events
export const getAllEvents = (page = 0, size = 10) => {
  return axiosInstance.get(`${API_URL}/page?page=${page}&size=${size}`);
};

// Get upcoming events
export const getUpcomingEvents = () => {
  return axiosInstance.get(`${API_URL}/upcoming`);
};

// Get events with available tickets
export const getEventsWithTickets = () => {
  return axiosInstance.get(`${API_URL}/available`);
};

// Get event by ID
export const getEventById = (id) => {
  return axiosInstance.get(`${API_URL}/${id}`);
};

// Get events by type
export const getEventsByType = (type) => {
  return axiosInstance.get(`${API_URL}/type/${type}`);
};

// Search events by name
export const searchEvents = (name) => {
  return axiosInstance.get(`${API_URL}/search?name=${name}`);
};

// Get events by city
export const getEventsByCity = (city) => {
  return axiosInstance.get(`${API_URL}/city/${city}`);
};