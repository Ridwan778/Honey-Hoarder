import * as THREE from 'three';


export class HealthBar{

    constructor(health, maxHealth){
        this.health = health;
        this.maxHealth = maxHealth;

        this.group = new THREE.Group();

        // the health bar border geometry, which is slightly larger than the health bar itself
        const borderGeometry = new THREE.PlaneGeometry(6.5, 73); 
        const borderMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide}); 
        this.borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        this.borderMesh.position.set(-56, 9.95, -0.1);
        this.borderMesh.rotateX(Math.PI/2);
        this.group.add(this.borderMesh); 

        // the health bar background geometry, which is the same size as the health bar itself
        const bordercopyGeometry = new THREE.PlaneGeometry(5, 72); 
        const bordercopyMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}); // but white material
        this.bordercopyMesh = new THREE.Mesh(bordercopyGeometry, bordercopyMaterial);
        this.bordercopyMesh.position.set(-56, 9.97, -0.1);
        this.bordercopyMesh.rotateX(Math.PI/2);
        this.group.add(this.bordercopyMesh); 

        // The health bar
        const healthBarGeometry = new THREE.PlaneGeometry(5, 72);
        const healthBarMaterial = new THREE.MeshBasicMaterial({color: 0x00ff0f, side: THREE.DoubleSide});
        this.healthBarMesh = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        this.healthBarMesh.position.set(-56, 10, 0); 
        this.healthBarMesh.rotateX(Math.PI/2);
        this.group.add(this.healthBarMesh);
        // to add the text beside the health bar for realtime health
        this.healthValueSprite = this.createHealthValueSprite(`${health}`);
        this.group.add(this.healthValueSprite);
        }


    
    //health bar value
    createHealthValueSprite(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128; 
        canvas.height = 64;

        // basic text settings
        context.fillStyle = '#000000'; 
        context.font = 'Bold 40px Arial'; 
        context.textAlign = 'center';
        context.fillText(text, canvas.width/ 2, canvas.height/ 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // creating a sprite material and sprite using the texture
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.position.set(-56, 15, 0); 
        sprite.scale.set(10, 5, 1); 
        return sprite;
    }

    updateHealthBar(health, maxHealth) {
        if(health!=0){
        const healthPercentage = health / maxHealth;
        this.healthBarMesh.scale.y = healthPercentage; 
        if (health>50){
            this.healthBarMesh.material.color.set(0xffff00);    
        }
        else if (health <= 50 && health > 20) {
            this.healthBarMesh.material.color.set(0xffa500); 
        } else if (health <= 20) {
            this.healthBarMesh.material.color.set(0xff0000); 
        }

        // removes old health bar value
        this.group.remove(this.healthValueSprite);
        //and puts new 
        this.healthValueSprite = this.createHealthValueSprite(`${health}`);
        //grouping for all health components
        this.group.add(this.healthValueSprite);
    }
    else{
        this.healthBarMesh.material.color.set(0xffffff);
        this.group.remove(this.healthValueSprite);
        this.healthValueSprite = this.createHealthValueSprite(`${health}`);
        this.group.add(this.healthValueSprite);
        // return; 
    }
        
    }
    
}


