/**
 * Graph Data Structure - MazeGraph
 * 
 * PURPOSE: Represents maze connectivity for pathfinding (hint system)
 * WHY GRAPH: Mazes are naturally graphs where tiles are nodes and
 * walkable paths are edges. Enables BFS/DFS for shortest path finding.
 * 
 * ACADEMIC JUSTIFICATION:
 * - Natural representation of maze connectivity
 * - BFS guarantees shortest path in unweighted graphs
 * - Flexible for weighted paths (future: different terrain costs)
 * - Essential for AI pathfinding and hint systems
 */

export class MazeGraph {
    constructor() {
        this.adjacencyList = new Map();
    }

    /**
     * Add a node (tile) to the graph
     * @param {string|number} tileId - Unique tile identifier
     * @param {Object} tileData - Optional tile data
     */
    addNode(tileId, tileData = {}) {
        if (!this.adjacencyList.has(tileId)) {
            this.adjacencyList.set(tileId, {
                neighbors: [],
                data: tileData
            });
        }
    }

    /**
     * Add an edge (connection) between two tiles
     * @param {string|number} tileId1 - First tile ID
     * @param {string|number} tileId2 - Second tile ID
     * @param {number} weight - Edge weight (default: 1)
     */
    addEdge(tileId1, tileId2, weight = 1) {
        // Ensure both nodes exist
        this.addNode(tileId1);
        this.addNode(tileId2);

        // Add bidirectional edge (undirected graph)
        const node1 = this.adjacencyList.get(tileId1);
        const node2 = this.adjacencyList.get(tileId2);

        // Check if edge already exists
        if (!node1.neighbors.find(n => n.id === tileId2)) {
            node1.neighbors.push({ id: tileId2, weight });
        }

        if (!node2.neighbors.find(n => n.id === tileId1)) {
            node2.neighbors.push({ id: tileId1, weight });
        }
    }

    /**
     * Remove an edge between two tiles
     * @param {string|number} tileId1 - First tile ID
     * @param {string|number} tileId2 - Second tile ID
     */
    removeEdge(tileId1, tileId2) {
        const node1 = this.adjacencyList.get(tileId1);
        const node2 = this.adjacencyList.get(tileId2);

        if (node1) {
            node1.neighbors = node1.neighbors.filter(n => n.id !== tileId2);
        }

        if (node2) {
            node2.neighbors = node2.neighbors.filter(n => n.id !== tileId1);
        }
    }

    /**
     * Get all neighbors of a tile
     * @param {string|number} tileId - Tile identifier
     * @returns {Array} - Array of neighbor objects
     */
    getNeighbors(tileId) {
        const node = this.adjacencyList.get(tileId);
        return node ? node.neighbors : [];
    }

    /**
     * Breadth-First Search to find shortest path
     * @param {string|number} startNode - Starting tile ID
     * @param {string|number} endNode - Target tile ID
     * @returns {Array|null} - Path as array of tile IDs, or null if no path
     */
    bfs(startNode, endNode) {
        if (!this.adjacencyList.has(startNode) || !this.adjacencyList.has(endNode)) {
            return null;
        }

        if (startNode === endNode) {
            return [startNode];
        }

        const queue = [[startNode]];
        const visited = new Set([startNode]);

        while (queue.length > 0) {
            const path = queue.shift();
            const currentNode = path[path.length - 1];

            const neighbors = this.getNeighbors(currentNode);

            for (const neighbor of neighbors) {
                if (neighbor.id === endNode) {
                    return [...path, neighbor.id];
                }

                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push([...path, neighbor.id]);
                }
            }
        }

        return null; // No path found
    }

    /**
     * Depth-First Search to find a path
     * @param {string|number} startNode - Starting tile ID
     * @param {string|number} endNode - Target tile ID
     * @returns {Array|null} - Path as array of tile IDs, or null if no path
     */
    dfs(startNode, endNode) {
        if (!this.adjacencyList.has(startNode) || !this.adjacencyList.has(endNode)) {
            return null;
        }

        const visited = new Set();
        const path = [];

        const dfsHelper = (currentNode) => {
            visited.add(currentNode);
            path.push(currentNode);

            if (currentNode === endNode) {
                return true;
            }

            const neighbors = this.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    if (dfsHelper(neighbor.id)) {
                        return true;
                    }
                }
            }

            path.pop();
            return false;
        };

        const found = dfsHelper(startNode);
        return found ? path : null;
    }

    /**
     * Check if a path exists between two nodes
     * @param {string|number} startNode - Starting tile ID
     * @param {string|number} endNode - Target tile ID
     * @returns {boolean} - True if path exists
     */
    hasPath(startNode, endNode) {
        return this.bfs(startNode, endNode) !== null;
    }

    /**
     * Get the shortest path distance (number of edges)
     * @param {string|number} startNode - Starting tile ID
     * @param {string|number} endNode - Target tile ID
     * @returns {number} - Distance or -1 if no path
     */
    getDistance(startNode, endNode) {
        const path = this.bfs(startNode, endNode);
        return path ? path.length - 1 : -1;
    }

    /**
     * Get all nodes in the graph
     * @returns {Array} - Array of all node IDs
     */
    getAllNodes() {
        return Array.from(this.adjacencyList.keys());
    }

    /**
     * Get the number of nodes
     * @returns {number} - Node count
     */
    getNodeCount() {
        return this.adjacencyList.size;
    }

    /**
     * Check if a node exists
     * @param {string|number} tileId - Tile identifier
     * @returns {boolean} - True if exists
     */
    hasNode(tileId) {
        return this.adjacencyList.has(tileId);
    }

    /**
     * Remove a node and all its edges
     * @param {string|number} tileId - Tile identifier
     */
    removeNode(tileId) {
        if (!this.adjacencyList.has(tileId)) {
            return;
        }

        // Remove all edges to this node
        const neighbors = this.getNeighbors(tileId);
        neighbors.forEach(neighbor => {
            this.removeEdge(tileId, neighbor.id);
        });

        // Remove the node itself
        this.adjacencyList.delete(tileId);
    }

    /**
     * Clear the entire graph
     */
    clear() {
        this.adjacencyList.clear();
    }

    /**
     * Get graph statistics
     * @returns {Object} - Graph statistics
     */
    getStats() {
        let totalEdges = 0;
        this.adjacencyList.forEach(node => {
            totalEdges += node.neighbors.length;
        });

        return {
            nodes: this.getNodeCount(),
            edges: totalEdges / 2, // Divide by 2 for undirected graph
            avgDegree: this.getNodeCount() > 0 ? totalEdges / this.getNodeCount() : 0
        };
    }
}

export default MazeGraph;
