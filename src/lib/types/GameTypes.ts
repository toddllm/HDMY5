export type Vector2D = {
    x: number;
    y: number;
};

export type Vector3D = {
    x: number;
    y: number;
    z: number;
};

export type Shape2D = 'rectangle' | 'circle' | 'triangle';
export type Shape3D = 'cube' | 'sphere' | 'cylinder' | 'cone';

// Entity types for game objects
export type EntityType = 
    // Characters
    'hero' | 'wizard' | 'fairy' | 'robot' | 
    // Enemies
    'monster' | 'boss' | 'minion' | 'drone' |
    // Items
    'potion' | 'weapon' | 'armor' | 'portal' | 'key' | 'treasure';

// Specific character types
export type CharacterType = 'fred' | 'tom' | 'casta' | 'elda' | 'dr-nikic';

// Monster types with different abilities and drops
export type MonsterType = 'goblin' | 'troll' | 'dragon' | 'zombie' | 'skeleton' | 'ghost';

// Item types that can be collected
export type ItemType = 'eye-of-elder' | 'health-potion' | 'mana-potion' | 'elder-portal' | 'sword' | 'shield';

export type ObjectProperties2D = {
    width: number;
    height: number;
    color: string;
    shape: Shape2D;
};

export type ObjectProperties3D = {
    width: number;
    height: number;
    depth: number;
    color: string;
    shape: Shape3D;
};

export type EntityProperties = {
    entityType: EntityType;
    health: number;
    speed: number;
    damage?: number;
    defense?: number;
    drops?: ItemDrop[];
    specialAbilities?: string[];
    characterType?: CharacterType;
    monsterType?: MonsterType;
    itemType?: ItemType;
    description: string;
    isHostile: boolean;
    interactable: boolean;
};

export type ItemDrop = {
    itemType: ItemType;
    dropRate: number; // 0-1 probability
    minQuantity: number;
    maxQuantity: number;
};

export type GameObject = {
    id: string;
    name: string;
    position: Vector3D;
    type: '2d' | '3d' | 'entity';
    properties: ObjectProperties2D | ObjectProperties3D | EntityProperties;
    components: GameComponent[];
};

export type GameComponent = {
    id: string;
    type: string;
    properties: Record<string, any>;
};

export type GameScene = {
    id: string;
    name: string;
    objects: GameObject[];
    type: '2d' | '3d';
};

// Predefined game entities
export const PREDEFINED_ENTITIES = {
    // Heroes and characters
    FRED: {
        name: "Fred the Adventurer",
        entityType: "hero" as EntityType,
        characterType: "fred" as CharacterType,
        health: 100,
        speed: 5,
        damage: 10,
        defense: 5,
        specialAbilities: ["Double Strike", "Shield Bash"],
        description: "A brave adventurer seeking fortune and glory.",
        isHostile: false,
        interactable: true
    },
    TOM: {
        name: "Tom the Archer",
        entityType: "hero" as EntityType,
        characterType: "tom" as CharacterType,
        health: 80,
        speed: 7,
        damage: 15,
        defense: 3,
        specialAbilities: ["Rapid Fire", "Eagle Eye"],
        description: "A skilled archer with deadly precision.",
        isHostile: false,
        interactable: true
    },
    CASTA: {
        name: "Casta the Wizard",
        entityType: "wizard" as EntityType,
        characterType: "casta" as CharacterType,
        health: 60,
        speed: 4,
        damage: 20,
        defense: 2,
        specialAbilities: ["Fireball", "Ice Storm", "Teleport"],
        description: "A powerful wizard with mastery over the elements.",
        isHostile: false,
        interactable: true
    },
    ELDA: {
        name: "Elda the Fairy",
        entityType: "fairy" as EntityType,
        characterType: "elda" as CharacterType,
        health: 40,
        speed: 8,
        specialAbilities: ["Heal", "Enchant", "Fairy Dust"],
        description: "A magical fairy who can heal wounds and enchant items.",
        isHostile: false,
        interactable: true
    },
    DR_NIKIC: {
        name: "Dr. Nikic",
        entityType: "robot" as EntityType,
        characterType: "dr-nikic" as CharacterType,
        health: 120,
        speed: 3,
        damage: 25,
        defense: 10,
        specialAbilities: ["Laser Beam", "Robot Army", "Self Repair"],
        description: "An evil robot scientist bent on world domination.",
        isHostile: true,
        interactable: true
    },
    
    // Monsters
    GOBLIN: {
        name: "Goblin",
        entityType: "monster" as EntityType,
        monsterType: "goblin" as MonsterType,
        health: 30,
        speed: 6,
        damage: 5,
        defense: 2,
        drops: [
            { itemType: "health-potion" as ItemType, dropRate: 0.3, minQuantity: 1, maxQuantity: 2 }
        ],
        description: "A small, green creature with a mischievous grin.",
        isHostile: true,
        interactable: false
    },
    TROLL: {
        name: "Troll",
        entityType: "monster" as EntityType,
        monsterType: "troll" as MonsterType,
        health: 80,
        speed: 3,
        damage: 15,
        defense: 8,
        drops: [
            { itemType: "eye-of-elder" as ItemType, dropRate: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemType: "health-potion" as ItemType, dropRate: 0.5, minQuantity: 1, maxQuantity: 3 }
        ],
        description: "A large, brutish creature with tough skin.",
        isHostile: true,
        interactable: false
    },
    DRAGON: {
        name: "Dragon",
        entityType: "boss" as EntityType,
        monsterType: "dragon" as MonsterType,
        health: 200,
        speed: 4,
        damage: 30,
        defense: 15,
        drops: [
            { itemType: "eye-of-elder" as ItemType, dropRate: 0.8, minQuantity: 2, maxQuantity: 5 },
            { itemType: "sword" as ItemType, dropRate: 0.5, minQuantity: 1, maxQuantity: 1 }
        ],
        specialAbilities: ["Fire Breath", "Wing Gust", "Tail Swipe"],
        description: "A fearsome dragon that breathes fire and guards treasure.",
        isHostile: true,
        interactable: false
    },
    ZOMBIE: {
        name: "Zombie",
        entityType: "monster" as EntityType,
        monsterType: "zombie" as MonsterType,
        health: 40,
        speed: 2,
        damage: 8,
        defense: 3,
        drops: [
            { itemType: "health-potion" as ItemType, dropRate: 0.2, minQuantity: 1, maxQuantity: 1 }
        ],
        description: "A reanimated corpse that hungers for brains.",
        isHostile: true,
        interactable: false
    },
    SKELETON: {
        name: "Skeleton",
        entityType: "monster" as EntityType,
        monsterType: "skeleton" as MonsterType,
        health: 35,
        speed: 5,
        damage: 10,
        defense: 2,
        drops: [
            { itemType: "eye-of-elder" as ItemType, dropRate: 0.05, minQuantity: 1, maxQuantity: 1 }
        ],
        description: "A walking skeleton that rattles as it moves.",
        isHostile: true,
        interactable: false
    },
    GHOST: {
        name: "Ghost",
        entityType: "monster" as EntityType,
        monsterType: "ghost" as MonsterType,
        health: 50,
        speed: 7,
        damage: 12,
        defense: 5,
        drops: [
            { itemType: "mana-potion" as ItemType, dropRate: 0.4, minQuantity: 1, maxQuantity: 2 },
            { itemType: "eye-of-elder" as ItemType, dropRate: 0.2, minQuantity: 1, maxQuantity: 1 }
        ],
        specialAbilities: ["Invisibility", "Possess"],
        description: "A spectral entity that can pass through walls.",
        isHostile: true,
        interactable: false
    },
    
    // Items
    EYE_OF_ELDER: {
        name: "Eye of Elder",
        entityType: "item" as EntityType,
        itemType: "eye-of-elder" as ItemType,
        health: 1,
        speed: 0,
        description: "A mystical eye that sees beyond dimensions. Collect these to build the Elder Portal.",
        isHostile: false,
        interactable: true
    },
    ELDER_PORTAL: {
        name: "Elder Portal",
        entityType: "portal" as EntityType,
        itemType: "elder-portal" as ItemType,
        health: 100,
        speed: 0,
        description: "A portal to the realm of the Elders. Requires 10 Eyes of Elder to activate.",
        isHostile: false,
        interactable: true
    },
    HEALTH_POTION: {
        name: "Health Potion",
        entityType: "potion" as EntityType,
        itemType: "health-potion" as ItemType,
        health: 1,
        speed: 0,
        description: "Restores health when consumed.",
        isHostile: false,
        interactable: true
    },
    MANA_POTION: {
        name: "Mana Potion",
        entityType: "potion" as EntityType,
        itemType: "mana-potion" as ItemType,
        health: 1,
        speed: 0,
        description: "Restores mana when consumed.",
        isHostile: false,
        interactable: true
    },
    SWORD: {
        name: "Sword",
        entityType: "weapon" as EntityType,
        itemType: "sword" as ItemType,
        health: 1,
        speed: 0,
        damage: 15,
        description: "A sharp sword that deals significant damage.",
        isHostile: false,
        interactable: true
    },
    SHIELD: {
        name: "Shield",
        entityType: "armor" as EntityType,
        itemType: "shield" as ItemType,
        health: 1,
        speed: 0,
        defense: 10,
        description: "A sturdy shield that provides protection.",
        isHostile: false,
        interactable: true
    }
};
