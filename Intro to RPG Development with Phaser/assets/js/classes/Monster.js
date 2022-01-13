class Monster extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame, id, health, maxHealth) {
        super(scene, x, y, key, frame);
        this.scene = scene;
        this.id = id;
        this.health = health;
        this.maxHealth = maxHealth;

        // enable physics
        this.scene.physics.world.enable(this);

        // set monster immovable
        this.setImmovable(false);

        // scale the monster - making the monster double the size than the sprite is.
        this.setScale(2);

        // collide with world bounds
        this.body.setCollideWorldBounds(true); // stopping the monster from leaving the physical world.

        // add the monster to our existing scene
        this.scene.add.existing(this);

        // update the origin
        this.setOrigin(0);

        this.createHealthBar();
    } 

    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x000000, 1);
        this.healthBar.fillRect(this.x, this.y - 8, 64, 5);
        this.healthBar.fillGradientStyle(0xff0000, 0xFFB7B7, 4); // fill with a gradient colour
        this.healthBar.fillRect(this.x, this.y - 8, 64 * (this.health / this.maxHealth), 5);
    }

    updateHealth(health) {
        this.health = health;
        this.updateHealthBar();
    }

    makeActive() {
        this.setActive(true); // reactivates object.
        this.setVisible(true); // make visible.
        this.body.checkCollision.none = false; // renables collisions with this object.
        this.updateHealthBar();

        // set the boolean to show to show that this object is active.
        this.bActive = true;
    }

    makeInactive() {
        this.setActive(false); // set the object inactive. This allows getFirstDead() to pick it and reactive it.
        this.setVisible(false); // stop rendering the object temporarily otherwise it will not disappear.
        this.body.checkCollision.none = true; // stops the player from colliding with the bounding box of the chest.
        this.healthBar.clear();

        // set the boolean to show that this object is inactive.
        this.bActive = false;
    }

    update() {
        this.updateHealthBar();
    }
}