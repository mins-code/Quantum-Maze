/**
 * Tree Data Structure - Level Hierarchy
 * 
 * PURPOSE: Represents level progression as a hierarchical tree
 * WHY TREE: Naturally represents parent-child relationships between levels
 * (e.g., World 1 -> Level 1.1, 1.2). Enables efficient level unlocking logic.
 * 
 * ACADEMIC JUSTIFICATION:
 * - Hierarchical structure matches game progression naturally
 * - O(log n) average-case search in balanced trees
 * - Easy to implement unlock dependencies
 * - Supports multiple progression paths
 */

/**
 * TreeNode class representing a single level
 */
export class TreeNode {
    constructor(levelId, levelData = {}) {
        this.levelId = levelId;
        this.data = {
            ...levelData,
            levelId
        };
        this.children = [];
        this.parent = null;
        this.isUnlocked = false;
        this.isCompleted = false;
    }

    /**
     * Add a child level
     * @param {TreeNode} childNode - Child node to add
     */
    addChild(childNode) {
        childNode.parent = this;
        this.children.push(childNode);
    }

    /**
     * Check if this level has children
     * @returns {boolean} - True if has children
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * Get all child levels
     * @returns {Array} - Array of child nodes
     */
    getChildren() {
        return this.children;
    }
}

/**
 * LevelHierarchy class managing the entire level tree
 */
export class LevelHierarchy {
    constructor() {
        this.root = null;
        this.levelMap = new Map(); // For O(1) level lookup by ID
    }

    /**
     * Set the root level (typically World 1 or Tutorial)
     * @param {string|number} levelId - Level identifier
     * @param {Object} levelData - Level data
     */
    setRoot(levelId, levelData = {}) {
        this.root = new TreeNode(levelId, levelData);
        this.root.isUnlocked = true; // Root is always unlocked
        this.levelMap.set(levelId, this.root);
    }

    /**
     * Add a level as a child of another level
     * @param {string|number} parentId - Parent level ID
     * @param {string|number} childId - Child level ID
     * @param {Object} childData - Child level data
     * @returns {boolean} - True if added successfully
     */
    addLevel(parentId, childId, childData = {}) {
        const parentNode = this.levelMap.get(parentId);

        if (!parentNode) {
            console.error(`Parent level ${parentId} not found`);
            return false;
        }

        if (this.levelMap.has(childId)) {
            console.error(`Level ${childId} already exists`);
            return false;
        }

        const childNode = new TreeNode(childId, childData);
        parentNode.addChild(childNode);
        this.levelMap.set(childId, childNode);

        return true;
    }

    /**
     * Get a level by ID
     * @param {string|number} levelId - Level identifier
     * @returns {TreeNode|null} - Level node or null if not found
     */
    getLevel(levelId) {
        return this.levelMap.get(levelId) || null;
    }

    /**
     * Unlock a level
     * @param {string|number} levelId - Level identifier
     * @returns {boolean} - True if unlocked successfully
     */
    unlockLevel(levelId) {
        const level = this.getLevel(levelId);
        if (level) {
            level.isUnlocked = true;
            return true;
        }
        return false;
    }

    /**
     * Mark a level as completed and unlock its children
     * @param {string|number} levelId - Level identifier
     * @returns {Array} - Array of newly unlocked level IDs
     */
    completeLevel(levelId) {
        const level = this.getLevel(levelId);
        const unlockedLevels = [];

        if (level) {
            level.isCompleted = true;

            // Unlock all child levels
            level.children.forEach(child => {
                if (!child.isUnlocked) {
                    child.isUnlocked = true;
                    unlockedLevels.push(child.levelId);
                }
            });
        }

        return unlockedLevels;
    }

    /**
     * Get the next unlocked level after the current one
     * @param {string|number} currentLevelId - Current level ID
     * @returns {TreeNode|null} - Next level or null
     */
    getNextLevel(currentLevelId) {
        const currentLevel = this.getLevel(currentLevelId);

        if (!currentLevel) {
            return null;
        }

        // First, check if current level has unlocked children
        const unlockedChild = currentLevel.children.find(child => child.isUnlocked);
        if (unlockedChild) {
            return unlockedChild;
        }

        // If no unlocked children, check siblings
        if (currentLevel.parent) {
            const siblings = currentLevel.parent.children;
            const currentIndex = siblings.indexOf(currentLevel);

            for (let i = currentIndex + 1; i < siblings.length; i++) {
                if (siblings[i].isUnlocked) {
                    return siblings[i];
                }
            }
        }

        return null;
    }

    /**
     * Get all unlocked levels
     * @returns {Array} - Array of unlocked level nodes
     */
    getUnlockedLevels() {
        const unlocked = [];
        this.levelMap.forEach(level => {
            if (level.isUnlocked) {
                unlocked.push(level);
            }
        });
        return unlocked;
    }

    /**
     * Get all completed levels
     * @returns {Array} - Array of completed level nodes
     */
    getCompletedLevels() {
        const completed = [];
        this.levelMap.forEach(level => {
            if (level.isCompleted) {
                completed.push(level);
            }
        });
        return completed;
    }

    /**
     * Get the total number of levels
     * @returns {number} - Total level count
     */
    getTotalLevels() {
        return this.levelMap.size;
    }

    /**
     * Get completion percentage
     * @returns {number} - Percentage of completed levels (0-100)
     */
    getCompletionPercentage() {
        const total = this.getTotalLevels();
        if (total === 0) return 0;

        const completed = this.getCompletedLevels().length;
        return Math.round((completed / total) * 100);
    }

    /**
     * Traverse the tree in level-order (BFS)
     * @param {Function} callback - Function to execute for each node
     */
    traverseLevelOrder(callback) {
        if (!this.root) return;

        const queue = [this.root];

        while (queue.length > 0) {
            const node = queue.shift();
            callback(node);
            queue.push(...node.children);
        }
    }

    /**
     * Clear the entire tree
     */
    clear() {
        this.root = null;
        this.levelMap.clear();
    }
}

export default LevelHierarchy;
