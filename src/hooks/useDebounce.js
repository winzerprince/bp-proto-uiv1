/**
 * @file hooks/useDebounce.js
 * @description Custom hook for debouncing values
 */

import { useState, useEffect } from 'react';

/**
 * Debounces a value by delaying its update
 * Useful for search inputs and expensive operations
 * 
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {T} Debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This will only run when user stops typing for 300ms
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounces a callback function
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedHandleSearch = useDebouncedCallback((term) => {
 *   performSearch(term);
 * }, 300);
 */
export function useDebouncedCallback(callback, delay = 500) {
  const [timeoutId, setTimeoutId] = useState(null);

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
