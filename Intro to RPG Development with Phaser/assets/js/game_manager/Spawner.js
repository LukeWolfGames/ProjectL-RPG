class Spawner {
    constructor(config, spawnLocations, addObject, deleteObject, moveObjects) {
        this.id = config.id; // unique identifier for each spawner we can keep track of in the Game Manager
        this.spawnInterval = config.spawnInterval; // loop through and create objects over time under the limit
        this.limit = config.limit; // maximum amount of objects to spawn
        this.objectType = config.spawnerType; // we want to use one spawner for chest and monsters
        this.spawnLocations = spawnLocations; // refer to the chest and monster locations that we created in Tiled.
        this.addObject = addObject;// used for communicating between Game Manager and spawner, when we delete one from the game manager, we also need to delete one from the spawner as well.
        this.deleteObject = deleteObject; // same as above...
        this.moveObjects = moveObjects;


        this.objectsCreated = []; // keeping track of the objects that have been created in an array.
        
        this.start();
    }

    start() {
        // used for creating our interval that will be used to create our objects.
        this.interval = setInterval(() => {
            if (this.objectsCreated.length < this.limit) {
                this.spawnObject();
            }
        }, this.spawnInterval);

        if (this.objectType === SpawnerType.MONSTER) {
            this.moveMonsters();
        }

    }

    spawnObject() {
        if (this.objectType === SpawnerType.CHEST) {
            this.spawnChest();
        } else if (this.objectType === SpawnerType.MONSTER) {
            this.spawnMonster();
        }
    }

    spawnChest() {
        const location = this.pickRandomLocation(); 
        const chest = new ChestModel(location[0], location[1], randomNumber(10, 20), this.id);
        this.objectsCreated.push(chest);
        this.addObject(chest.id, chest);

    }

    spawnMonster() {
        const location = this.pickRandomLocation(); 
        const monster = new MonsterModel(
            location[0], // x co-ordinate spawn position
            location[1], // y co-ordinate spawn position
            randomNumber(10, 20), // random gold value
            this.id, // specific id for the monster
            randomNumber(0, 20), // random frame (appearance of monster)
            randomNumber(3, 5), // random health
            1, // attack value
        );
        this.objectsCreated.push(monster);
        this.addObject(monster.id, monster);
    }

    pickRandomLocation() {
        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        const invalidLocation = this.objectsCreated.some((obj) => {
            if (obj.x === location[0] && obj.y === location[1]) {
                return true;
            }
            return false;
        });

        if (invalidLocation) return this.pickRandomLocation();
        
        return location;
    }

    removeObject(id) {
        this.objectsCreated = this.objectsCreated.filter(obj => obj.id !== id);
        this.deleteObject(id); 
    }

    moveMonsters() {
        this.moveMonsterInterval = setInterval(() => {
            this.objectsCreated.forEach((monster) => {
                monster.move();
            });

        this.moveObjects();
        }, 1000);

    }
}