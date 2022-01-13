class Chest extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame, coins, id) {
        super(scene, x, y, key, frame);
        this.scene = scene; // the scene this game object will be added to
        this.coins = coins; // the amount of coins this chest contains.
        this.id = id;

        // enable physics
        this.scene.physics.world.enable(this);

        // add the player to our existing scene
        this.scene.add.existing(this);
        
        // scale the chest game object
        this.setScale(2);
    }

    makeActive() {
        this.setActive(true); // reactivates object.
        this.setVisible(true); // make visible.
        this.body.checkCollision.none = false; // renables collisions with this object.

        // // set the boolean to show to show that this object is active.
        // this.bActive = true;
    }

    makeInactive() {
        this.setActive(false); // set the object inactive. This allows getFirstDead() to pick it and reactive it.
        this.setVisible(false); // stop rendering the object temporarily otherwise it will not disappear.
        this.body.checkCollision.none = true; // stops the player from colliding with the bounding box of the chest.

        // // set the boolean to show that this object is inactive.
        // this.bActive = false;
    }
}