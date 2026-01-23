/**
 * Set Data Structure - SwitchManager
 * 
 * PURPOSE: Tracks which switches/triggers are currently active
 * WHY SET: Sets guarantee uniqueness - a switch can only be ON or OFF,
 * never duplicated. Provides O(1) lookup, insertion, and deletion.
 * 
 * ACADEMIC JUSTIFICATION:
 * - Automatic duplicate prevention (switch can't be activated twice)
 * - O(1) average-case operations for all methods
 * - Memory efficient for sparse switch states
 * - Natural representation of binary states (on/off)
 */

export class SwitchManager {
    constructor() {
        this.activeSwitches = new Set();
    }

    /**
     * Activate a switch
     * @param {string|number} id - Switch identifier
     * @returns {boolean} - True if newly activated, false if already active
     */
    activate(id) {
        const wasInactive = !this.activeSwitches.has(id);
        this.activeSwitches.add(id);
        return wasInactive;
    }

    /**
     * Deactivate a switch
     * @param {string|number} id - Switch identifier
     * @returns {boolean} - True if was active, false if already inactive
     */
    deactivate(id) {
        return this.activeSwitches.delete(id);
    }

    /**
     * Check if a switch is currently active
     * @param {string|number} id - Switch identifier
     * @returns {boolean} - True if active
     */
    isActive(id) {
        return this.activeSwitches.has(id);
    }

    /**
     * Toggle a switch state
     * @param {string|number} id - Switch identifier
     * @returns {boolean} - New state (true = active, false = inactive)
     */
    toggle(id) {
        if (this.isActive(id)) {
            this.deactivate(id);
            return false;
        } else {
            this.activate(id);
            return true;
        }
    }

    /**
     * Get all active switch IDs
     * @returns {Array} - Array of active switch IDs
     */
    getActiveSwitches() {
        return Array.from(this.activeSwitches);
    }

    /**
     * Get the count of active switches
     * @returns {number} - Number of active switches
     */
    getActiveCount() {
        return this.activeSwitches.size;
    }

    /**
     * Reset all switches to inactive
     */
    reset() {
        this.activeSwitches.clear();
    }

    /**
     * Check if all specified switches are active
     * @param {Array} ids - Array of switch IDs to check
     * @returns {boolean} - True if all are active
     */
    areAllActive(ids) {
        return ids.every(id => this.isActive(id));
    }

    /**
     * Check if any of the specified switches are active
     * @param {Array} ids - Array of switch IDs to check
     * @returns {boolean} - True if at least one is active
     */
    isAnyActive(ids) {
        return ids.some(id => this.isActive(id));
    }
}

export default SwitchManager;
