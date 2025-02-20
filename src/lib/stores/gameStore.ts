import { writable, get } from 'svelte/store';
import type { GameScene, GameObject } from '$lib/types/GameTypes';
import { LocalStorageService, type DataService } from '$lib/services/DataService';

// Initialize data service (can be swapped later)
const dataService: DataService = new LocalStorageService();

// Create stores
export const scenes = writable<GameScene[]>([]);
export const activeScene = writable<GameScene | null>(null);
export const selectedObject = writable<GameObject | null>(null);

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
        type
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
