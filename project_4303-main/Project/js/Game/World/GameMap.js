import { TileNode } from './TileNode.js';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { VectorUtil } from '../../Util/VectorUtil';
import { MazeGenerator } from './MazeGenerator.js';


export class GameMap {
	
	// Constructor for our GameMap class
	constructor() {

		this.start = new THREE.Vector3(-50,0,-35);

		this.width = 100;
		this.depth = 70;
	

		// We also need to define a tile size 
		// for our tile based map
		this.tileSize = 10;

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width/this.tileSize;
		this.rows = this.depth/this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer(this.start, this.tileSize, this.cols);

		// Goals for multi goal flow field
		this.goals = [];

		this.index = 0;
	}

	// initialize the GameMap
	init(scene) {
		this.scene = scene; 
		this.graph.initGraph();
		this.graph.initEdges();

		let mazeGenerator = new MazeGenerator(this.graph);
		mazeGenerator.generate();

		// Set the game object to our rendering
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes);
	}



	// Method to get location from a node
	localize(node) {
		let x = this.start.x+(node.x*this.tileSize)+this.tileSize*0.5;
		let y = this.tileSize;
		let z = this.start.z+(node.z*this.tileSize)+this.tileSize*0.5;

		return new THREE.Vector3(x,y,z);
	}

	// Method to get node from a location
	quantize(location) {
		let x = Math.floor((location.x - this.start.x)/this.tileSize);
		let z = Math.floor((location.z - this.start.z)/this.tileSize);
		
		return this.graph.getNode(x,z);
	}

	setupSingleGoalFlowField(goal) {
		this.goals = [goal];
		this.setupFlowField(this.goals);
	}

	setupFlowField(goals) {
		this.goals = goals;
		this.heatmap = new Map();
		this.flowfield = new Map();

		let unvisited = [];

		for (let g of goals) {
			unvisited.push(g);
			this.heatmap.set(g, 0);
		}


		while (unvisited.length > 0) {

			let node = unvisited.shift();

			for (let edge of node.edges) {

				let neighbour = edge.node;
				let cost = edge.cost;

				let offset = 0;
				if (this.heatmap.has(node)) {
					offset = this.heatmap.get(node);
				}

				let pathCost = cost + offset;

				if (!this.heatmap.has(neighbour) ||
					this.heatmap.get(neighbour) > pathCost) {
					this.heatmap.set(neighbour, pathCost);

					if (!unvisited.includes(neighbour)) {
						unvisited.push(neighbour);
					}
				}
			}
		}
		this.mapRenderer.showFlowField(this);

		for (let [n, cost] of this.heatmap) {
			if (goals.includes(n)) {
				this.flowfield.set(n, new THREE.Vector3(0,0,0));
			} else {

				let best = null;
				let lowest = Number.MAX_VALUE;

				for (let edge of n.edges) {

					let cost = this.heatmap.get(edge.node);
					
					if (lowest > cost) {
						best = edge.node;
						lowest = cost;
					}
				}
				let dir = VectorUtil.sub(this.localize(best), this.localize(n));
				this.flowfield.set(n, dir);
			}
		}

		this.mapRenderer.showFlowField(this);
	}

	halton(base, index, start, end) {

		let result = 0;
		let denominator = 1;
	
		while (index > 0) {
			denominator = denominator * base;
			result = result + (index % base) / denominator;
			index = Math.floor(index/base);
		}
		let output = ((result) * (end - start)) + start;
		return output;
	
	}
	
	getNodeFromHalton(){
	
		let x = Math.floor(this.halton(3, this.index, 0, this.cols));
		let z = Math.floor(this.halton(2, this.index, 0, this.rows));
	
		let node = this.graph.getNode(x, z);
		
		this.index++;
		
		return this.graph.getNode(x,z);
	}

}




















