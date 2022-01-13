class Player extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        this.scene = scene; // the scene this game object will be added to
        
        // enable physics
        this.scene.physics.world.enable(this);

        // set player immovable
        this.setImmovable(true);

        // scale the player - making the player double the size than the sprite is.
        this.setScale(2);

        // add the player to our existing scene
        this.scene.add.existing(this);
    }
}