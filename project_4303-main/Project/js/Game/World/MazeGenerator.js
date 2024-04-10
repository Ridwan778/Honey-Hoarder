import { TileNode } from './TileNode.js';
import * as THREE from 'three';
import { Graph } from './Graph';


export class MazeGenerator {

	constructor(graph) {
		this.graph = graph;
		this.visited = [];
		this.stack = [];
		this.map = new Map();
	}

	getRandomNeighbour(node) {
		let unvisited = [];
		for (let e of node.edges) {
			if (!this.visited.includes(e.node)) {
				unvisited.push(e.node);
			}
		}
		if (unvisited.length > 0) {
			let random = Math.floor(Math.random()*unvisited.length);
			return unvisited[random];
		}
		return null;
	}

	generate() {
		let x = Math.floor(Math.random() * this.graph.cols);
		let z = Math.floor(Math.random() * this.graph.rows);

		let start = this.graph.getNode(x,z);
		this.generateHelper(start);
		this.setupGraph();
	}

	generateHelper(current) {
		this.visited.push(current);
		this.stack.push(current);

		let n = this.getRandomNeighbour(current);

		while (n == null) {
			if (this.stack.length == 0) {
				return;
			}
			current = this.stack.pop();
			n = this.getRandomNeighbour(current);
		}

		if (!this.map.has(current)) {
			this.map.set(current, []);
		}

		if (!this.map.has(n)) {
			this.map.set(n, []);
		}

		let currentEdges = this.map.get(current);
		currentEdges.push(current.getEdge(n));
		this.map.set(current, currentEdges);

		let nEdges = this.map.get(n);
		nEdges.push(n.getEdge(current));
		this.map.set(n, nEdges);

		this.generateHelper(n);
	}


	setupGraph() {
		for (let n of this.graph.nodes) {
			n.edges = this.map.get(n);
		}
	}








	
}
	