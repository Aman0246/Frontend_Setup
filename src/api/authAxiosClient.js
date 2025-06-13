// src/api/authAxiosClient.js
import axios from 'axios';
import { baseURL } from './baseUrl';

const authAxiosClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
});

authAxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authAxiosClient;
