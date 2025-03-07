import { writable, get, derived } from 'svelte/store';
import type { GameScene, GameObject, EntityType, CharacterTemplate, ItemType } from '$lib/types/GameTypes';
import { LocalStorageService, type DataService } from '$lib/services/DataService';
import { createHero, createEnemy, createItem, createPortal } from '$lib/types/GameTypes';

// Initialize data service (can be swapped later)
const dataService: DataService = new LocalStorageService();

// Create stores
export const scenes = writable<GameScene[]>([]);
export const activeScene = writable<GameScene | null>(null);
export const selectedObject = writable<GameObject | null>(null);
export const gameMode = writable<'builder' | 'playtest'>('builder');
export const inventory = writable<Record<string, number>>({});
export const playerHealth = writable<number>(100);
export const gameMessages = writable<{message: string, type: 'info' | 'success' | 'error' | 'combat'}[]>([]);
export const currentPlayerEntity = writable<GameObject | null>(null);

// Derived stores for game entities
export const sceneHeroes = derived([activeScene], ([$activeScene]) => {
    if (!$activeScene) return [];
    return $activeScene.objects.filter(obj => obj.entity && obj.entity.entityType === 'hero');
});

export const sceneEnemies = derived([activeScene], ([$activeScene]) => {
    if (!$activeScene) return [];
    return $activeScene.objects.filter(obj => obj.entity && obj.entity.entityType === 'enemy');
});

export const sceneItems = derived([activeScene], ([$activeScene]) => {
    if (!$activeScene) return [];
    return $activeScene.objects.filter(obj => obj.entity && obj.entity.entityType === 'item');
});

export const sceneNPCs = derived([activeScene], ([$activeScene]) => {
    if (!$activeScene) return [];
    return $activeScene.objects.filter(obj => obj.entity && obj.entity.entityType === 'npc');
});

export const eyesOfElder = derived([inventory], ([$inventory]) => {
    return $inventory['eye_of_elder'] || 0;
});

// Load initial data
export async function initializeStore() {
    const loadedScenes = await dataService.getScenes();
    scenes.set(loadedScenes);
    
    if (loadedScenes.length > 0 && !get(activeScene)) {
        activeScene.set(loadedScenes[0]);
    }
}

export const createScene = async (name: string, type: '2d' | '3d') => {
    const newScene: GameScene = {
        id: crypto.randomUUID(),
        name,
        objects: [],
        type,
        backgroundColor: type === '3d' ? '#87CEEB' : '#f0f0f0', // Sky blue for 3D, light gray for 2D
        ambientLight: type === '3d' ? { color: '#ffffff', intensity: 0.8 } : undefined
    };
    
    await dataService.saveScene(newScene);
    scenes.update(currentScenes => [...currentScenes, newScene]);
    return newScene;
};

export async function updateScene(updatedScene: GameScene) {
    await dataService.updateScene(updatedScene);
    scenes.update(currentScenes => 
        currentScenes.map(scene => 
            scene.id === updatedScene.id ? updatedScene : scene
        )
    );
    
    // If updating the active scene, refresh it
    activeScene.update(current => 
        current?.id === updatedScene.id ? updatedScene : current
    );
}

export async function deleteScene(sceneId: string) {
    await dataService.deleteScene(sceneId);
    scenes.update(currentScenes => 
        currentScenes.filter(scene => scene.id !== sceneId)
    );
    
    activeScene.update(current => 
        current?.id === sceneId ? null : current
    );
}

export function selectObject(object: GameObject | null) {
    selectedObject.set(object);
}

// Game Entity Creation Helpers
export function createGameObject(
    entityType: EntityType,
    template: CharacterTemplate | undefined,
    itemType: ItemType | undefined,
    position = { x: 400, y: 300, z: 0 }
): GameObject {
    let entityProperties;
    
    if (entityType === 'hero' || entityType === 'npc') {
        entityProperties = createHero(template || 'custom');
    } else if (entityType === 'enemy') {
        entityProperties = createEnemy(template || 'custom');
    } else if (entityType === 'item') {
        entityProperties = createItem(itemType || 'custom');
    } else if (entityType === 'portal') {
        entityProperties = createPortal();
    } else {
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
    
    // Visual properties based on entity type
    let shape: '2d' | '3d' = '3d';
    let width = 50;
    let height = 80;
    let depth = 50;
    let color = '#ff0000';
    
    if (entityType === 'hero') {
        color = '#4287f5'; // Blue
    } else if (entityType === 'enemy') {
        color = '#f54242'; // Red
    } else if (entityType === 'npc') {
        color = '#42f59e'; // Green
        width = 40;
        height = 60;
    } else if (entityType === 'item') {
        color = '#f5d742'; // Yellow
        width = 30;
        height = 30;
        depth = 30;
    } else if (entityType === 'portal') {
        color = '#9b42f5'; // Purple
        width = 80;
        height = 120;
        depth = 80;
    }
    
    const object: GameObject = {
        id: crypto.randomUUID(),
        name: entityProperties.displayName,
        position,
        rotation: { x: 0, y: 0, z: 0 },
        type: shape,
        properties: {
            width,
            height,
            depth,
            color,
            shape: 'cube',
        },
        entity: entityProperties,
        components: []
    };
    
    return object;
}

export function addObjectToScene(object: GameObject) {
    activeScene.update(scene => {
        if (!scene) return scene;
        
        return {
            ...scene,
            objects: [...scene.objects, object]
        };
    });
}

export function removeObjectFromScene(objectId: string) {
    activeScene.update(scene => {
        if (!scene) return scene;
        
        return {
            ...scene,
            objects: scene.objects.filter(obj => obj.id !== objectId)
        };
    });
    
    // If the removed object was selected, deselect it
    selectedObject.update(obj => obj?.id === objectId ? null : obj);
}

// Game Testing Mode Functions
export function startGameTest() {
    gameMode.set('playtest');
    resetGameState();
    
    // Find a hero to set as player
    const scene = get(activeScene);
    if (!scene) return;
    
    const heroes = scene.objects.filter(obj => obj.entity && obj.entity.entityType === 'hero');
    if (heroes.length > 0) {
        currentPlayerEntity.set(heroes[0]);
        
        if (heroes[0].entity?.combatStats) {
            playerHealth.set(heroes[0].entity.combatStats.health);
        }
    }
    
    addGameMessage('Game test started! Use WASD keys to move the character and click on enemies to attack them.', 'info');
}

export function endGameTest() {
    gameMode.set('builder');
    resetGameState();
}

export function resetGameState() {
    inventory.set({});
    playerHealth.set(100);
    gameMessages.set([]);
    currentPlayerEntity.set(null);
}

export function addItemToInventory(itemId: string, quantity = 1) {
    inventory.update(items => {
        return {
            ...items,
            [itemId]: (items[itemId] || 0) + quantity
        };
    });
    
    addGameMessage(`Collected ${quantity}x ${itemId.replace('_', ' ')}`, 'success');
}

export function removeItemFromInventory(itemId: string, quantity = 1) {
    inventory.update(items => {
        const currentQuantity = items[itemId] || 0;
        if (currentQuantity <= quantity) {
            const newItems = { ...items };
            delete newItems[itemId];
            return newItems;
        }
        
        return {
            ...items,
            [itemId]: currentQuantity - quantity
        };
    });
}

export function usePortal(portalObject: GameObject) {
    const portalRequirements = portalObject.entity?.itemRequirements || [];
    const currentInventory = get(inventory);
    
    // Check if player has required items
    for (const req of portalRequirements) {
        const currentAmount = currentInventory[req.itemId] || 0;
        if (currentAmount < req.quantity) {
            addGameMessage(`Portal requires ${req.quantity}x ${req.itemId.replace('_', ' ')}. You only have ${currentAmount}.`, 'error');
            return false;
        }
    }
    
    // Consume the required items
    for (const req of portalRequirements) {
        removeItemFromInventory(req.itemId, req.quantity);
    }
    
    addGameMessage('You have activated the Elder Portal! Game completed!', 'success');
    return true;
}

export function combat(playerObject: GameObject, enemyObject: GameObject) {
    if (!playerObject.entity?.combatStats || !enemyObject.entity?.combatStats) {
        addGameMessage('Cannot initiate combat: missing combat stats', 'error');
        return false;
    }
    
    const playerStats = playerObject.entity.combatStats;
    const enemyStats = enemyObject.entity.combatStats;
    
    // Simple combat calculation
    const playerDamage = Math.max(1, playerStats.attack - enemyStats.defense / 2);
    const enemyDamage = Math.max(1, enemyStats.attack - playerStats.defense / 2);
    
    // Update health
    playerHealth.update(health => Math.max(0, health - enemyDamage));
    
    // Calculate remaining enemy health
    const remainingEnemyHealth = Math.max(0, enemyStats.health - playerDamage);
    
    // Log combat results
    addGameMessage(
        `You dealt ${playerDamage} damage to ${enemyObject.entity.displayName}. ` +
        `${enemyObject.entity.displayName} dealt ${enemyDamage} damage to you.`,
        'combat'
    );
    
    // Check if enemy is defeated
    if (remainingEnemyHealth <= 0) {
        addGameMessage(`You defeated ${enemyObject.entity.displayName}!`, 'success');
        
        // Give drops if any
        if (enemyObject.entity.drops && enemyObject.entity.drops.length > 0) {
            for (const drop of enemyObject.entity.drops) {
                const dropChance = Math.random() * 100;
                if (dropChance <= drop.dropRate) {
                    const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
                    addItemToInventory(drop.itemId, quantity);
                }
            }
        }
        
        // Remove enemy from scene temporarily
        removeObjectFromScene(enemyObject.id);
        
        return true;
    }
    
    // Update enemy health
    activeScene.update(scene => {
        if (!scene) return scene;
        
        const updatedObjects = scene.objects.map(obj => {
            if (obj.id === enemyObject.id && obj.entity?.combatStats) {
                return {
                    ...obj,
                    entity: {
                        ...obj.entity,
                        combatStats: {
                            ...obj.entity.combatStats,
                            health: remainingEnemyHealth
                        }
                    }
                };
            }
            return obj;
        });
        
        return {
            ...scene,
            objects: updatedObjects
        };
    });
    
    // Check player health
    if (get(playerHealth) <= 0) {
        addGameMessage('You have been defeated! Game over.', 'error');
        return false;
    }
    
    return true;
}

export function addGameMessage(message: string, type: 'info' | 'success' | 'error' | 'combat' = 'info') {
    gameMessages.update(messages => {
        // Keep only last 10 messages
        const newMessages = [...messages, { message, type }];
        if (newMessages.length > 10) {
            return newMessages.slice(newMessages.length - 10);
        }
        return newMessages;
    });
}

export function interactWithNPC(npcObject: GameObject) {
    if (!npcObject.entity || npcObject.entity.entityType !== 'npc') {
        return;
    }
    
    addGameMessage(`Talking to ${npcObject.entity.displayName}...`, 'info');
    
    if (npcObject.entity.dialogueId) {
        // In a real implementation, this would trigger dialogue system
        addGameMessage(`"Greetings adventurer! I am ${npcObject.entity.displayName}."`, 'info');
    }
    
    // Handle Elda the Fairy special interaction
    if (npcObject.entity.template === 'elda_fairy') {
        playerHealth.update(health => Math.min(100, health + 20));
        addGameMessage('Elda the Fairy healed you for 20 health points!', 'success');
    }
}