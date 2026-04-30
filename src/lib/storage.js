// lib/storage.js

export const getStorageData = (key, defaultValue = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const saveStorageData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};