/**
 * Axios Configuration - Quantum Maze
 * Centralized API client with interceptors
 */

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Handle 401 Unauthorized - Token expired or invalid
            if (status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Return error message from server
            return Promise.reject(data.error || 'An error occurred');
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject('Network error. Please check your connection.');
        } else {
            // Something else happened
            return Promise.reject(error.message || 'An unexpected error occurred');
        }
    }
);

// ==================== GAME API FUNCTIONS ====================

/**
 * Submit score with replay history and coin data
 * @param {number} levelId - Level ID
 * @param {number} moves - Number of moves
 * @param {number} timeTaken - Time taken in seconds
 * @param {Array} history - Replay history array
 * @param {number} coinsCollected - Number of coins collected
 * @param {number} maxCoins - Total coins available in level
 * @returns {Promise} - API response
 */
export const submitScore = async (levelId, moves, timeTaken, history = [], coinsCollected = 0, maxCoins = 0) => {
    try {
        const response = await api.post('/game/score', {
            levelId,
            moves,
            timeTaken,
            replayHistory: history,
            coinsCollected,
            maxCoins
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting score:', error);
        throw error;
    }
};

/**
 * Fetch best replay for a level
 * @param {number} levelId - Level ID
 * @returns {Promise<Array>} - Replay history array
 */
export const fetchBestReplay = async (levelId) => {
    try {
        const response = await api.get(`/game/replay/${levelId}`);
        return response.data.replayHistory;
    } catch (error) {
        console.error('Error fetching replay:', error);
        return null;
    }
};

export default api;
