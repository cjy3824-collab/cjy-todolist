import { useMemo } from 'react';
import useCalendarStore from '../store/calendarStore';

const useCalendar = () => {
  const {
    calendarData,
    selectedDate,
    isLoading,
    error,
    setCalendarData,
    setSelectedDate,
    getTodosByDate,
    fetchCalendarData,
    setLoading,
    setError,
    clearError,
    reset,
  } = useCalendarStore();

  return useMemo(() => ({
    calendarData,
    selectedDate,
    isLoading,
    error,
    setCalendarData,
    setSelectedDate,
    getTodosByDate,
    fetchCalendarData,
    setLoading,
    setError,
    clearError,
    reset,
  }), [
    calendarData,
    selectedDate,
    isLoading,
    error,
    setCalendarData,
    setSelectedDate,
    getTodosByDate,
    fetchCalendarData,
    setLoading,
    setError,
    clearError,
    reset,
  ]);
};

export default useCalendar;