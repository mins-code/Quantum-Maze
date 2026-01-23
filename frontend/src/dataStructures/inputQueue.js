/**
 * Queue Data Structure - InputQueue
 * 
 * PURPOSE: Buffers keyboard inputs using FIFO (First In, First Out)
 * WHY QUEUE: Ensures inputs are processed in the order they were received,
 * preventing "ghost inputs" and maintaining game fairness.
 * 
 * ACADEMIC JUSTIFICATION:
 * - FIFO principle ensures fair input processing
 * - Prevents input loss during rapid key presses
 * - O(1) enqueue and dequeue operations
 * - Essential for responsive game controls
 */

export class InputQueue {
    constructor() {
        this.items = [];
    }

    /**
     * Add an input to the end of the queue
     * @param {*} input - Input data to enqueue
     */
    enqueue(input) {
        this.items.push(input);
    }

    /**
     * Remove and return the first input from the queue
     * @returns {*} - The dequeued input or null if empty
     */
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }

    /**
     * View the first input without removing it
     * @returns {*} - The first input or null if empty
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} - True if empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get the current size of the queue
     * @returns {number} - Number of items in queue
     */
    size() {
        return this.items.length;
    }

    /**
     * Clear all inputs from the queue
     */
    clear() {
        this.items = [];
    }

    /**
     * Get all items in the queue (for debugging)
     * @returns {Array} - Copy of all items
     */
    getAll() {
        return [...this.items];
    }
}

export default InputQueue;
