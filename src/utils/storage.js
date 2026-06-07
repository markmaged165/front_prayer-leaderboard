import { playerAPI, seasonAPI } from "../services/api";
import { STORAGE_KEYS } from "../constants/app";

export async function fbGet(key) {
  try {
    // Try to get from localStorage first
    const localData = localStorage.getItem(key);
    if (localData) return JSON.parse(localData);
    
    // If not in localStorage, try to get from MongoDB based on key
    if (key === STORAGE_KEYS.PLAYERS) {
      const data = await playerAPI.getAll();
      return data;
    } else if (key === STORAGE_KEYS.SEASONS) {
      const data = await seasonAPI.getAll();
      return data;
    }
    
    return null;
  } catch (error) {
    console.error("fbGet failed for key:", key, error.message);
    // Fall back to localStorage
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : null;
  }
}

export async function fbSet(key, value) {
  try {
    // Always save to localStorage
    localStorage.setItem(key, JSON.stringify(value));
    
    // Try to save to MongoDB
    if (key === STORAGE_KEYS.PLAYERS) {
      await playerAPI.replaceAll(value);
    } else if (key === STORAGE_KEYS.SEASONS) {
      await seasonAPI.replaceAll(value);
    }
    
    return true;
  } catch (error) {
    console.error("fbSet failed for key:", key, error.message);
    // Still return true since localStorage was saved
    return true;
  }
}

export function lload(key, def) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : def;
  } catch {
    return def;
  }
}

export const lsave = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore errors
  }
};
