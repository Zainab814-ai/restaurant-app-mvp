import AsyncStorage from '@react-native-async-storage/async-storage';

// Single source of truth for Base URL
const BASE_URL = 'http://10.195.208.211:5000/api';

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

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export default apiClient;