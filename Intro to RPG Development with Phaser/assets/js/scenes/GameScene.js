class GameScene extends Phaser.Scene {
    constructor() {
        super("Game");
    }

    init () {
        this.scene.launch("Ui"); // starting the scene in parellel
    }

    create() {
        this.createMap();
        this.createAudio();
        this.createGroups();
        this.createInput();
        this.createGameManager();
    }

    update() {
        if (this.player) {
            this.player.update(this.cursors);
        }
    }
    createAudio() {
        this.goldPickupAudio = this.sound.add("goldSound", { loop: false, volume: 0.5 });
        this.playerAttackAudio = this.sound.add("playerAttack", { loop: false, volume: 0.1 });
        this.playerDamageAudio = this.sound.add("playerDamage", { loop: false, volume: 0.2 });
        this.playerDeathAudio = this.sound.add("playerDeath", { loop: false, volume: 1.0 });
        this.monsterDeathAudio = this.sound.add("enemyDeath", { loop: false, volume: 0.2 });
    }

    createPlayer(playerObject) {
        this.player = new PlayerContainer(
            this, 
            playerObject.x * 2, // location of where to spawn the player on the x axis
            playerObject.y * 2, // location of where to spawn the player on the y axis.
            "characters", // the spritesheet to read from to get the player's image.
            0, // the frame number of the spritesheet to render the player's image.
            playerObject.health, // the health value of the player
            playerObject.maxHealth, // the maxhealth value of the player
            playerObject.id, // the id of the specific player instance
            this.playerAttackAudio, // parsing in the audio when the player attacks.
        );
    }

    createGroups() {
        // create a chest group
        this.chests = this.physics.add.group();

        // create a monster group
        this.monsters = this.physics.add.group();
        this.monsters.runChildUpdate = true;
    }

    spawnChest(chestObject) {
        let chest = this.chests.getFirstDead();

        if (!chest) {
            chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, "items", 0, chestObject.gold, chestObject.id);
            // add chest to chests group
            this.chests.add(chest);
            
        } else {
            chest.coins = chestObject.gold;
            chest.id = chestObject.id;
            chest.setPosition(chestObject.x * 2, chestObject.y * 2);
            chest.makeActive();
        }

    }

    spawnMonster(monsterObject) {
        let monster = this.monsters.getFirstDead();

        if (!monster) {
            monster = new Monster(this, 
                monsterObject.x, // spawn x coordinate for monster 
                monsterObject.y, // spawn y coordinate for monster
                "monsters", // spritesheet key for the monster
                monsterObject.frame, // frame appearance the monster will take
                monsterObject.id, // the uuid specific to the monster
                monsterObject.health,
                monsterObject.maxHealth,
            );
            // add monster to monster group
            this.monsters.add(monster);
            
        } else { // reactivating a monster from within the object pool
            monster.id = monsterObject.id;
            monster.health = monsterObject.health;
            monster.maxHealth = monsterObject.maxHealth;
            monster.setTexture("monsters", monsterObject.frame);
            monster.setPosition(monsterObject.x * 2, monsterObject.y * 2);
            monster.makeActive();
        }
    }

    createInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    addCollisions() {
        // player
        this.physics.add.collider(this.player, this.map.blockedLayer); // colliding an object with another object.
        this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this); // checking for overlap between player and chest and then executing a function if this is true.

        // monster
        this.physics.add.collider(this.monsters, this.map.blockedLayer);

        // check for overlaps between player's weapon and monster game objects
        this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    }

    enemyOverlap(weapon, enemy) {
        if (this.player.playerAttacking && !this.player.swordHit) {
            this.player.swordHit = true;
            this.events.emit("monsterAttacked", enemy.id, this.player.id);
        }
    }

    collectChest(player, chest) {

            console.log("collected chest")
            // play gold pickup sound
            this.goldPickupAudio.play();
            
            // picking up the chest
            this.events.emit("pickUpChest", chest.id, player.id);
    
    }

    createMap() {
        // create map
        this.map = new Map(this, "map", "background", "background", "blocked");
    }

    createGameManager() {
        this.events.on("spawnPlayer", (playerObject) => {
            this.createPlayer(playerObject);
            this.addCollisions();
        });

        this.events.on("chestSpawned", (chest) => {
            this.spawnChest(chest);
        });

        this.events.on("monsterSpawned", (monster) => {
            this.spawnMonster(monster);
        });

        this.events.on("chestRemoved", (chestId) => {
            this.chests.getChildren().forEach((chest) => {
                if (chest.id === chestId) {
                    chest.makeInactive();
                }
            });
        });

        this.events.on("monsterRemoved", (monsterId) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.makeInactive();
                    this.monsterDeathAudio.play();
                }
            });
        });

        this.events.on("updatePlayerHealth", (playerId, health) => {
            if (health < this.player.health) {
                this.playerDamageAudio.play();
            }
            this.player.updateHealth(health);
        });

        this.events.on("respawnPlayer", (playerObject) => {
            this.playerDeathAudio.play();
            this.player.respawn(playerObject);
        });


        this.events.on("updateMonsterHealth", (monsterId, health) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.updateHealth(health);
                }
            });
        });

        this.events.on("monsterMovement", (monsters) => {
            this.monsters.getChildren().forEach((monster) => {
                Object.keys(monsters).forEach((monsterId) => {
                    if (monster.id === monsterId) {
                        this.physics.moveToObject(monster, monsters[monsterId], 40);
                    }
                });

            });
        });

        this.gameManager = new GameManager(this, this.map.map.objects);
        this.gameManager.setup();
    }
}