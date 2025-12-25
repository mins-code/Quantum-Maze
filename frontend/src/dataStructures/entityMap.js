/**
 * Map Data Structure - EntityManager
 * 
 * PURPOSE: Manages game entities (players, enemies, items) with key-value pairs
 * WHY MAP: Maps provide O(1) average-case lookup by ID, perfect for quickly
 * accessing and updating entity data during game loops.
 * 
 * ACADEMIC JUSTIFICATION:
 * - O(1) average-case access, insertion, and deletion
 * - Maintains insertion order (useful for rendering layers)
 * - Flexible key types (strings, numbers, objects)
 * - Efficient for dynamic entity management
 */

export class EntityManager {
    constructor() {
        this.entities = new Map();
    }

    /**
     * Add a new entity
     * @param {string|number} id - Unique entity identifier
     * @param {Object} data - Entity data
     * @returns {boolean} - True if added, false if ID already exists
     */
    addEntity(id, data) {
        if (this.entities.has(id)) {
            return false; // Entity already exists
        }
        this.entities.set(id, {
            ...data,
            id,
            createdAt: Date.now()
        });
        return true;
    }

    /**
     * Get an entity by ID
     * @param {string|number} id - Entity identifier
     * @returns {Object|null} - Entity data or null if not found
     */
    getEntity(id) {
        return this.entities.get(id) || null;
    }

    /**
     * Update an existing entity
     * @param {string|number} id - Entity identifier
     * @param {Object} newData - New data to merge
     * @returns {boolean} - True if updated, false if not found
     */
    updateEntity(id, newData) {
        if (!this.entities.has(id)) {
            return false;
        }
        const currentData = this.entities.get(id);
        this.entities.set(id, {
            ...currentData,
            ...newData,
            id, // Preserve ID
            updatedAt: Date.now()
        });
        return true;
    }

    /**
     * Remove an entity
     * @param {string|number} id - Entity identifier
     * @returns {boolean} - True if removed, false if not found
     */
    removeEntity(id) {
        return this.entities.delete(id);
    }

    /**
     * Check if an entity exists
     * @param {string|number} id - Entity identifier
     * @returns {boolean} - True if exists
     */
    hasEntity(id) {
        return this.entities.has(id);
    }

    /**
     * Get all entities
     * @returns {Array} - Array of all entity objects
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get all entity IDs
     * @returns {Array} - Array of all entity IDs
     */
    getAllIds() {
        return Array.from(this.entities.keys());
    }

    /**
     * Get entities by type
     * @param {string} type - Entity type to filter by
     * @returns {Array} - Array of matching entities
     */
    getEntitiesByType(type) {
        return this.getAllEntities().filter(entity => entity.type === type);
    }

    /**
     * Get the count of entities
     * @returns {number} - Number of entities
     */
    getCount() {
        return this.entities.size;
    }

    /**
     * Clear all entities
     */
    clear() {
        this.entities.clear();
    }

    /**
     * Execute a function for each entity
     * @param {Function} callback - Function to execute (receives entity, id)
     */
    forEach(callback) {
        this.entities.forEach((entity, id) => callback(entity, id));
    }
}

export default EntityManager;
