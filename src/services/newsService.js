import axiosInstance from './axiosInstance';

/**
 * Fetches the latest Forex news and AI intelligence alerts from the backend.
 * @returns {Promise<Array>} List of news items.
 */
export const getForexNews = async () => {
    try {
        const response = await axiosInstance.get('/news');
        return response.data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};
