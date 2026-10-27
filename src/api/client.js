import AsyncStorage from '@react-native-async-storage/async-storage';

// Single source of truth for Base URL (Bina kisi extra space ke)
const BASE_URL = 'https://restaurant-app-mvp.vercel.app/api';

export const apiClient = async (endpoint, { body, headers: customHeaders, ...customConfig } = {}) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // URL aur endpoint dono se extra spaces automatic remove ho jayenge (.trim())
  const cleanBaseUrl = BASE_URL.trim();
  const cleanEndpoint = endpoint.trim();
  const fullUrl = `${cleanBaseUrl}${cleanEndpoint}`;

  const response = await fetch(fullUrl, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export default apiClient;