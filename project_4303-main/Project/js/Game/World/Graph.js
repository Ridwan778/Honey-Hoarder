import { TileNode } from './TileNode.js';
import * as THREE from 'three';

export class Graph {
	
	// Constructor for our Graph class
	constructor(tileSize, cols, rows) {

		// node array to hold our graph
		this.nodes = [];

		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;

		this.obstacles = [];
	}

	length() {
		return this.nodes.length;
	}
	
	// Initialize our game graph
	initGraph() {
		// Create a new tile node
		// for each index in the grid
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				let type = TileNode.Type.Ground;
				let node = new TileNode(this.nodes.length, i, j, type);

				this.nodes.push(node);
			}
		}

	}

	initEdges() {
		// Create west, east, north, south
		// edges for each node in our graph
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				// The index of our current node
				let index = j * this.cols + i;
				let current = this.nodes[index];

				if (current.type == TileNode.Type.Ground) {

					if (i > 0) {
						// CREATE A WEST EDGE
						let west = this.nodes[index - 1];
						current.tryAddEdge(west, this.tileSize);

			
					}

					if (i < this.cols - 1) {
						// CREATE AN EAST EDGE
						let east = this.nodes[index + 1];
						current.tryAddEdge(east, this.tileSize);

					}

					if (j > 0) {
						// CREATE A NORTH EDGE
						let north = this.nodes[index-this.cols];
						current.tryAddEdge(north, this.tileSize);
					}

					if (j < this.rows - 1) {
						// CREATE A SOUTH EDGE
						let south = this.nodes[index+this.cols];
						current.tryAddEdge(south, this.tileSize);
					}
				}

			}
		}

	}

	getNode(x, z) {
		return this.nodes[z * this.cols + x];
	}

	getRandomEmptyTile() {
		let index = Math.floor(Math.random()*(this.nodes.length));
		while (this.nodes[index].type == TileNode.Type.Obstacle) {
			index = Math.floor(Math.random()*(this.nodes.length));
		}
		return this.nodes[index];
	}


}