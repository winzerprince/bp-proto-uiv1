/**
 * @file hooks/useLocalStorage.js
 * @description Custom hook for managing localStorage with SSR support
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to sync state with localStorage
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - Initial/default value
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} 
 *   [storedValue, setValue, removeValue]
 * 
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage(key, initialValue) {
  // State to store value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
