/**
 * Stack Data Structure - GameStack
 * 
 * PURPOSE: Implements undo/redo functionality using LIFO (Last In, First Out)
 * WHY STACK: Perfect for undo/redo because the most recent action should be
 * undone first. Stacks provide O(1) push and pop operations.
 * 
 * ACADEMIC JUSTIFICATION:
 * - LIFO principle matches undo/redo semantics perfectly
 * - Constant-time operations for push/pop
 * - Simple and efficient memory management
 * - Industry-standard pattern for command history
 */

export class GameStack {
    constructor() {
        this.items = [];
    }

    /**
     * Add an item to the top of the stack
     * @param {*} data - Data to push onto stack
     */
    push(data) {
        this.items.push(data);
    }

    /**
     * Remove and return the top item from the stack
     * @returns {*} - The popped item or null if empty
     */
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.pop();
    }

    /**
     * View the top item without removing it
     * @returns {*} - The top item or null if empty
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }

    /**
     * Check if the stack is empty
     * @returns {boolean} - True if empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get the current size of the stack
     * @returns {number} - Number of items in stack
     */
    size() {
        return this.items.length;
    }

    /**
     * Clear all items from the stack
     */
    clear() {
        this.items = [];
    }

    /**
     * Get all items in the stack (for debugging)
     * @returns {Array} - Copy of all items
     */
    getAll() {
        return [...this.items];
    }
}

export default GameStack;
