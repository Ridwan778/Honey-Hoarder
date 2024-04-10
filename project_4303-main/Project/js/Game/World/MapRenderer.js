import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor(start, tileSize, cols) {

		this.start = start;
		this.tileSize = tileSize;
		this.cols = cols;

		this.groundGeometries = new THREE.BoxGeometry(0,0,0);
		this.wallGeometries = new THREE.BoxGeometry(0,0,0);
	
	}

	createRendering(graph) {
		// Iterate over all of the 
		// nodes in our graph
		for (let n of graph) {
			this.createTile(n);

		}

		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
		let wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

		let gameObject = new THREE.Group();
		let ground = new THREE.Mesh(this.groundGeometries, groundMaterial);
		let walls = new THREE.Mesh(this.wallGeometries, wallMaterial);

		gameObject.add(ground);
		gameObject.add(walls);

		return gameObject;
	}

	createTile(node) {

		let i = node.x;
		let j = node.z;
		let type = node.type;

		let x = (i * this.tileSize) + this.start.x;
		let y = 0;
		let z = (j * this.tileSize) + this.start.z;




		let geometry = new THREE.BoxGeometry(this.tileSize,
											 this.tileSize, 
											 this.tileSize);
		geometry.translate(x + 0.5 * this.tileSize,
						   y + 0.5 * this.tileSize,
						   z + 0.5 * this.tileSize);


		this.groundGeometries = BufferGeometryUtils.mergeGeometries(
										[this.groundGeometries,
										geometry]
									);
		
		this.buildWalls(node, x, y, z);


	}


	buildWalls(node, cx, cy, cz) {
		

		if (!node.hasEdgeTo(node.x-1, node.z)) {
			this.buildWall(cx,
				0.65 * this.tileSize,
						   cz + 0.5 * this.tileSize,
						   0.5,
						   this.tileSize, true);

		} 

		if (!node.hasEdgeTo(node.x+1, node.z)) {
			this.buildWall(cx + this.tileSize,
				0.65 * this.tileSize,
						   cz + 0.5 * this.tileSize,
						   0.5,
						   this.tileSize, true);

		}

		if (!node.hasEdgeTo(node.x, node.z-1)) {
			this.buildWall(cx + 0.5 * this.tileSize,
				0.65 * this.tileSize,
						   cz,
						   this.tileSize,
						   0.5,false);

		}

		if (!node.hasEdgeTo(node.x, node.z+1)) {
			this.buildWall(cx + 0.5 * this.tileSize,
						   0.65 * this.tileSize,
						   cz + this.tileSize,
						   this.tileSize,
						   0.5, false);

		}

	}

	buildWall(px, py, pz, sx, sz, vertical) {
		let wall;
		
		if (vertical){
			wall = new THREE.BoxGeometry(sx, this.tileSize, sz+0.5);
			wall.translate(px, py, pz);
		}
		else{
			wall = new THREE.BoxGeometry(sx, this.tileSize, sz);
			wall.translate(px, py, pz);
		}
		
		

		this.wallGeometries = 
			BufferGeometryUtils.mergeGeometries(
			[this.wallGeometries, wall]);
	}

	// Debug method
	highlight(vec, color) {
		let geometry = new THREE.BoxGeometry( this.tileSize, 1, this.tileSize ); 
		let material = new THREE.MeshBasicMaterial( { color: color } ); 
		
		geometry.translate(vec.x, vec.y+0.5, vec.z);
		this.flowfieldGraphics.add(new THREE.Mesh( geometry, material ));
		
	}

	// Debug method
	arrow(pos, vector) {

		vector.normalize();
		let origin = pos.clone();
		origin.y += 1.5;
		let length = this.tileSize;
		let hex = 0x000000;

		// used to check if flowfield is working
		// let arrowHelper = new THREE.ArrowHelper( vector, origin, length, hex );
		// this.flowfieldGraphics.add( arrowHelper );

	}

	
	// Debug method
	showFlowField(gameMap) {
		if ((this.flowfieldGraphics != undefined) 
			&& (this.flowfieldGraphics.children.length > 0)) {
				gameMap.scene.remove(this.flowfieldGraphics);
			
		}
		this.flowfieldGraphics = new THREE.Group();
			
		for (let [n,i] of gameMap.heatmap) {
			let nPos = gameMap.localize(n);
			if ((n == gameMap.goal) || (gameMap.goals.includes(n))) {
				this.highlight(nPos, new THREE.Color(0xffffff));
			} else {
				// this only works because i is kind of in the hue range (0,360)
				this.highlight(nPos, new THREE.Color(0x00ff00)); //new THREE.Color('hsl('+i*2+', 100%, 50%)')
				if (gameMap.flowfield.size != 0)
					this.arrow(nPos, gameMap.flowfield.get(n));
			}
			
		}
		gameMap.scene.add(this.flowfieldGraphics);
	}


}