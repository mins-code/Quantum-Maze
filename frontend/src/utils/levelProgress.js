/**
 * Level Completion Handler
 * Utility function to save level completion to backend
 */

import api from './api';

/**
 * Handle level completion
 * @param {number} levelId - The completed level ID
 * @param {number} moves - Number of moves taken
 * @param {number} time - Time taken in seconds
 * @returns {Promise} Response from backend with stars and unlock info
 */
export const onLevelComplete = async (levelId, moves, time) => {
    try {
        const response = await api.post(`/progress/complete/${levelId}`, {
            moves,
            time
        });

        return {
            success: true,
            data: response.data.data
        };
    } catch (error) {
        console.error('Error saving level completion:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Example usage in GameLevel component:
 * 
 * import { onLevelComplete } from '../../utils/levelProgress';
 * 
 * // When player wins:
 * const handleVictory = async () => {
 *   const result = await onLevelComplete(
 *     levelId,
 *     stats.moveCount,
 *     stats.elapsedTime
 *   );
 *   
 *   if (result.success) {
 *     setShowVictoryModal(true);
 *     // result.data contains: stars, nextLevelUnlocked, totalStars
 *   }
 * };
 */
