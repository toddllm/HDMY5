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
    // For advanced 3D objects
    segments?: number;
    wireframe?: boolean;
    texture?: string;
};

// Entity types for game characters, items, etc.
export type EntityType = 'hero' | 'enemy' | 'npc' | 'item' | 'portal';

// Character templates (predefined characters)
export type CharacterTemplate = 
    'fred' | 'tom' | 'casta' | 'dr_nikic' | 'elda_fairy' | 
    'skeleton' | 'zombie' | 'goblin' | 'dragon' | 'ghost' | 'custom';

// Item types
export type ItemType = 
    'weapon' | 'armor' | 'potion' | 'key' | 'quest' | 
    'resource' | 'eye_of_elder' | 'custom';

// Combat stats for entities that can fight
export type CombatStats = {
    health: number;
    attack: number;
    defense: number;
    speed: number;
    specialAbility?: string;
    level?: number;
};

// Item drop configuration
export type ItemDrop = {
    itemId: string;
    dropRate: number; // 0-100 percentage
    minQuantity: number;
    maxQuantity: number;
};

// Entity-specific properties
export type EntityProperties = {
    entityType: EntityType;
    template?: CharacterTemplate;
    displayName: string;
    description?: string;
    itemType?: ItemType;
    combatStats?: CombatStats;
    drops?: ItemDrop[];
    itemRequirements?: {
        itemId: string;
        quantity: number;
    }[];
    interactable?: boolean;
    dialogueId?: string;
    questId?: string;
};

// Game Component types
export type ComponentType = 
    'physics' | 'ai' | 'dialogue' | 'inventory' | 
    'quest' | 'interaction' | 'animation' | 'custom';

export type GameComponent = {
    id: string;
    type: ComponentType;
    properties: Record<string, any>;
};

// Main GameObject type
export type GameObject = {
    id: string;
    name: string;
    position: Vector3D;
    rotation?: Vector3D; // Added rotation for 3D objects
    scale?: Vector3D;    // Added scale for 3D objects
    type: '2d' | '3d';
    properties: ObjectProperties2D | ObjectProperties3D;
    entity?: EntityProperties; // For game entities
    components: GameComponent[];
    parentId?: string; // For hierarchical objects
    children?: string[]; // IDs of child objects
};

// Dialogue for NPCs and story elements
export type DialogueNode = {
    id: string;
    text: string;
    options?: {
        text: string;
        nextNodeId: string;
        requirement?: {
            itemId?: string;
            questComplete?: string;
        };
    }[];
    action?: {
        type: 'giveItem' | 'startQuest' | 'completeQuest' | 'teleport';
        targetId: string;
        quantity?: number;
    };
};

export type Dialogue = {
    id: string;
    name: string;
    startNodeId: string;
    nodes: DialogueNode[];
};

// Quest system
export type QuestObjective = {
    id: string;
    type: 'collect' | 'defeat' | 'talk' | 'location';
    targetId: string;
    quantity: number;
    completed: boolean;
};

export type Quest = {
    id: string;
    name: string;
    description: string;
    objectives: QuestObjective[];
    rewards: {
        itemId: string;
        quantity: number;
    }[];
    prerequisiteQuestIds?: string[];
};

// Game Scene type
export type GameScene = {
    id: string;
    name: string;
    objects: GameObject[];
    type: '2d' | '3d';
    dialogues?: Dialogue[];
    quests?: Quest[];
    backgroundColor?: string;
    ambientLight?: {
        color: string;
        intensity: number;
    };
    gravity?: Vector3D;
};

// Helper functions for creating entities
export function createHero(template: CharacterTemplate): EntityProperties {
    const baseStats: CombatStats = {
        health: 100,
        attack: 10,
        defense: 5,
        speed: 5
    };
    
    switch(template) {
        case 'fred':
            return {
                entityType: 'hero',
                template: 'fred',
                displayName: 'Fred the Brave',
                description: 'A courageous warrior with a heart of gold.',
                combatStats: {
                    ...baseStats,
                    attack: 15,
                    specialAbility: 'Mighty Slash'
                }
            };
        case 'tom':
            return {
                entityType: 'hero',
                template: 'tom',
                displayName: 'Tom the Agile',
                description: 'Quick on his feet and even quicker with his daggers.',
                combatStats: {
                    ...baseStats,
                    defense: 3,
                    speed: 10,
                    specialAbility: 'Shadow Step'
                }
            };
        case 'casta':
            return {
                entityType: 'hero',
                template: 'casta',
                displayName: 'Casta the Wizard',
                description: 'Master of arcane arts and magical knowledge.',
                combatStats: {
                    ...baseStats,
                    health: 80,
                    attack: 20,
                    defense: 2,
                    specialAbility: 'Arcane Explosion'
                }
            };
        case 'elda_fairy':
            return {
                entityType: 'npc',
                template: 'elda_fairy',
                displayName: 'Elda the Fairy',
                description: 'A magical fairy that guides heroes on their journey.',
                interactable: true
            };
        default:
            return {
                entityType: 'hero',
                template: 'custom',
                displayName: 'Custom Hero',
                description: 'A customizable hero character.',
                combatStats: baseStats
            };
    }
}

export function createEnemy(template: CharacterTemplate): EntityProperties {
    const baseStats: CombatStats = {
        health: 50,
        attack: 5,
        defense: 3,
        speed: 3
    };
    
    let entity: EntityProperties;
    
    switch(template) {
        case 'dr_nikic':
            entity = {
                entityType: 'enemy',
                template: 'dr_nikic',
                displayName: 'Dr. Nikic the Evil Robot Scientist',
                description: 'A brilliant but twisted mind bent on world domination.',
                combatStats: {
                    health: 200,
                    attack: 15,
                    defense: 15,
                    speed: 5,
                    specialAbility: 'Robot Minions'
                }
            };
            break;
        case 'skeleton':
            entity = {
                entityType: 'enemy',
                template: 'skeleton',
                displayName: 'Skeleton Warrior',
                description: 'An undead warrior that refuses to rest.',
                combatStats: {
                    ...baseStats,
                    health: 40,
                    defense: 2
                }
            };
            break;
        case 'zombie':
            entity = {
                entityType: 'enemy',
                template: 'zombie',
                displayName: 'Rotting Zombie',
                description: 'A shambling horror that hungers for flesh.',
                combatStats: {
                    ...baseStats,
                    health: 70,
                    attack: 6,
                    speed: 1
                }
            };
            break;
        case 'goblin':
            entity = {
                entityType: 'enemy',
                template: 'goblin',
                displayName: 'Forest Goblin',
                description: 'A mischievous forest dweller with a nasty temperament.',
                combatStats: {
                    ...baseStats,
                    health: 30,
                    speed: 6
                }
            };
            break;
        case 'dragon':
            entity = {
                entityType: 'enemy',
                template: 'dragon',
                displayName: 'Ancient Dragon',
                description: 'A fearsome beast of legend with fiery breath.',
                combatStats: {
                    health: 300,
                    attack: 30,
                    defense: 20,
                    speed: 8,
                    specialAbility: 'Fire Breath'
                }
            };
            break;
        case 'ghost':
            entity = {
                entityType: 'enemy',
                template: 'ghost',
                displayName: 'Spectral Ghost',
                description: 'An ethereal spirit that phases through solid objects.',
                combatStats: {
                    ...baseStats,
                    health: 45,
                    attack: 7,
                    defense: 10,
                    specialAbility: 'Phase Shift'
                }
            };
            break;
        default:
            entity = {
                entityType: 'enemy',
                template: 'custom',
                displayName: 'Custom Enemy',
                description: 'A customizable enemy character.',
                combatStats: baseStats
            };
    }
    
    // Default drops (can be customized)
    entity.drops = [];
    
    return entity;
}

export function createItem(type: ItemType): EntityProperties {
    switch(type) {
        case 'eye_of_elder':
            return {
                entityType: 'item',
                itemType: 'eye_of_elder',
                displayName: 'Eye of Elder',
                description: 'A mystical artifact used to build the Elder Portal.'
            };
        case 'weapon':
            return {
                entityType: 'item',
                itemType: 'weapon',
                displayName: 'Weapon',
                description: 'A basic weapon for combat.'
            };
        case 'armor':
            return {
                entityType: 'item',
                itemType: 'armor',
                displayName: 'Armor',
                description: 'Protective gear for battles.'
            };
        case 'potion':
            return {
                entityType: 'item',
                itemType: 'potion',
                displayName: 'Potion',
                description: 'A magical brew with beneficial effects.'
            };
        default:
            return {
                entityType: 'item',
                itemType: 'custom',
                displayName: 'Custom Item',
                description: 'A customizable item.'
            };
    }
}

export function createPortal(): EntityProperties {
    return {
        entityType: 'portal',
        displayName: 'Elder Portal',
        description: 'A mystical gateway to another dimension.',
        itemRequirements: [
            {
                itemId: 'eye_of_elder',
                quantity: 5
            }
        ]
    };
}
