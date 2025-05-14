// src/api/eventApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/events';

// Get all events
export const getAllEvents = (page = 0, size = 10) => {
  return axiosInstance.get(`${API_URL}/page?page=${page}&size=${size}`);
};

// Get all events (no pagination)
export const getAllEventsNoPagination = () => {
  return axiosInstance.get(API_URL);
};

// Get event by ID
export const getEventById = (id) => {
  return axiosInstance.get(`${API_URL}/${id}`);
};

// Get upcoming events
export const getUpcomingEvents = () => {
  return axiosInstance.get(`${API_URL}/upcoming`);
};

// Get events with available tickets
export const getEventsWithTickets = () => {
  return axiosInstance.get(`${API_URL}/available`);
};

// Get events by type
export const getEventsByType = (type) => {
  return axiosInstance.get(`${API_URL}/type/${type}`);
};

// Get events by status
export const getEventsByStatus = (status) => {
  return axiosInstance.get(`${API_URL}/status/${status}`);
};

// Get events by venue
export const getEventsByVenue = (venueId) => {
  return axiosInstance.get(`${API_URL}/venue/${venueId}`);
};

// Get events by creator
export const getEventsByCreator = (creatorId) => {
  return axiosInstance.get(`${API_URL}/creator/${creatorId}`);
};

// Get my created events
export const getMyEvents = () => {
  return axiosInstance.get(`${API_URL}/creator`);
};

// Search events by name
export const searchEvents = (name) => {
  return axiosInstance.get(`${API_URL}/search?name=${encodeURIComponent(name)}`);
};

// Get events by city
export const getEventsByCity = (city) => {
  return axiosInstance.get(`${API_URL}/city/${encodeURIComponent(city)}`);
};

// Create a new event
export const createEvent = (eventData) => {
  return axiosInstance.post(API_URL, eventData);
};

// Update an event
export const updateEvent = (id, eventData) => {
  return axiosInstance.put(`${API_URL}/${id}`, eventData);
};

// Delete an event
export const deleteEvent = (id) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};

// Update event status
export const updateEventStatus = (id, status) => {
  return axiosInstance.put(`${API_URL}/${id}/status?status=${status}`);
};