// src/hooks/useUsageData.js

import { useState, useEffect, useCallback } from 'react';
import { fetchSummary, fetchCategories, fetchDailyStats } from '../api/usageApi';

// ─── Main dashboard hook ──────────────────────────────────────
export function useDashboardData(selectedDate) {
  const [state, setState] = useState({
    summary: null,
    categories: null,
    daily: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = selectedDate ? { date: selectedDate } : {};

      const [summary, categories, daily] = await Promise.all([
        fetchSummary(params),
        fetchCategories(params),
        fetchDailyStats(7),
      ]);

      setState({
        summary,
        categories,
        daily,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const isNetworkError = !err.response;
      setState((s) => ({
        ...s,
        loading: false,
        error: isNetworkError
          ? 'Cannot reach backend. Is the server running on port 3001?'
          : `Server error: ${err.response?.data?.error || err.message}`,
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { ...state, refresh: load };
}
