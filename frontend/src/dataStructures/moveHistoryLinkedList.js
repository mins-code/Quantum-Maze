/**
 * Linked List Data Structure - Move History
 * 
 * PURPOSE: Stores complete move history for replay and analysis
 * WHY LINKED LIST: Efficient insertion at both ends, dynamic size,
 * and easy traversal for replay functionality. Better than arrays
 * for frequent insertions/deletions.
 * 
 * ACADEMIC JUSTIFICATION:
 * - O(1) insertion at head/tail
 * - Dynamic memory allocation (no pre-allocation needed)
 * - Efficient for sequential access (replay)
 * - Easy to implement undo/redo with bidirectional traversal
 */

/**
 * Node class for the linked list
 */
export class Node {
    constructor(moveData) {
        this.data = moveData;
        this.next = null;
        this.prev = null;
    }
}

/**
 * Doubly Linked List for move history
 */
export class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Append a move to the end of the list
     * @param {Object} moveData - Move data to append
     */
    append(moveData) {
        const newNode = new Node({
            ...moveData,
            timestamp: Date.now(),
            moveNumber: this.size + 1
        });

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.size++;
    }

    /**
     * Prepend a move to the beginning of the list
     * @param {Object} moveData - Move data to prepend
     */
    prepend(moveData) {
        const newNode = new Node(moveData);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }

        this.size++;
    }

    /**
     * Remove and return the last move
     * @returns {Object|null} - Last move data or null if empty
     */
    removeLast() {
        if (this.isEmpty()) {
            return null;
        }

        const removedData = this.tail.data;

        if (this.size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.size--;
        return removedData;
    }

    /**
     * Get all moves as an array
     * @returns {Array} - Array of all move data
     */
    getAllMoves() {
        const moves = [];
        let current = this.head;

        while (current !== null) {
            moves.push(current.data);
            current = current.next;
        }

        return moves;
    }

    /**
     * Get the last N moves
     * @param {number} n - Number of moves to retrieve
     * @returns {Array} - Array of last N moves
     */
    getLastNMoves(n) {
        const allMoves = this.getAllMoves();
        return allMoves.slice(-n);
    }

    /**
     * Get move at specific index
     * @param {number} index - Index of move (0-based)
     * @returns {Object|null} - Move data or null if invalid index
     */
    getMoveAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }

        let current = this.head;
        for (let i = 0; i < index; i++) {
            current = current.next;
        }

        return current.data;
    }

    /**
     * Check if the list is empty
     * @returns {boolean} - True if empty
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Get the size of the list
     * @returns {number} - Number of moves
     */
    getSize() {
        return this.size;
    }

    /**
     * Clear all moves
     */
    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Traverse the list and execute a callback for each move
     * @param {Function} callback - Function to execute for each move
     */
    forEach(callback) {
        let current = this.head;
        let index = 0;

        while (current !== null) {
            callback(current.data, index);
            current = current.next;
            index++;
        }
    }

    /**
     * Get the first move
     * @returns {Object|null} - First move data or null if empty
     */
    getFirst() {
        return this.head ? this.head.data : null;
    }

    /**
     * Get the last move
     * @returns {Object|null} - Last move data or null if empty
     */
    getLast() {
        return this.tail ? this.tail.data : null;
    }
}

export default LinkedList;
