// src/api/usageApi.js — all backend calls in one place

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hakitrackr-backend.onrender.com/api/api',
  timeout: 10000,
});

// GET /usage/summary — aggregated per domain
export const fetchSummary = async (params = {}) => {
  const { data } = await api.get('/usage/summary', { params });
  return data;
};

// GET /usage/categories — category breakdown for pie chart
export const fetchCategories = async (params = {}) => {
  const { data } = await api.get('/usage/categories', { params });
  return data;
};

// GET /usage/daily — day-by-day stats for timeline
export const fetchDailyStats = async (days = 7) => {
  const { data } = await api.get('/usage/daily', { params: { days } });
  return data;
};

// GET /usage — raw sessions
export const fetchRawSessions = async (params = {}) => {
  const { data } = await api.get('/usage', { params });
  return data;
};

// DELETE /usage — clear all data (dev)
export const clearAllData = async () => {
  const { data } = await api.delete('/usage');
  return data;
};
