import type { GameScene } from '$lib/types/GameTypes';

export interface DataService {
    getScenes(): Promise<GameScene[]>;
    saveScene(scene: GameScene): Promise<void>;
    updateScene(scene: GameScene): Promise<void>;
    deleteScene(sceneId: string): Promise<void>;
}

// Local Storage Implementation
export class LocalStorageService implements DataService {
    private readonly STORAGE_KEY = 'hdmy5-scenes';

    async getScenes(): Promise<GameScene[]> {
        const savedScenes = localStorage.getItem(this.STORAGE_KEY);
        if (savedScenes) {
            try {
                return JSON.parse(savedScenes);
            } catch (e) {
                console.error('Failed to load saved scenes:', e);
            }
        }
        return [];
    }

    async saveScene(scene: GameScene): Promise<void> {
        const scenes = await this.getScenes();
        scenes.push(scene);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenes));
    }

    async updateScene(scene: GameScene): Promise<void> {
        const scenes = await this.getScenes();
        const index = scenes.findIndex(s => s.id === scene.id);
        if (index !== -1) {
            scenes[index] = scene;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenes));
        }
    }

    async deleteScene(sceneId: string): Promise<void> {
        const scenes = await this.getScenes();
        const filteredScenes = scenes.filter(s => s.id !== sceneId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredScenes));
    }
}

// API Service Implementation (for future use)
export class APIService implements DataService {
    private readonly API_BASE = '/api/scenes';  // We'll implement this later

    async getScenes(): Promise<GameScene[]> {
        const response = await fetch(this.API_BASE);
        return response.json();
    }

    async saveScene(scene: GameScene): Promise<void> {
        await fetch(this.API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scene)
        });
    }

    async updateScene(scene: GameScene): Promise<void> {
        await fetch(`${this.API_BASE}/${scene.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scene)
        });
    }

    async deleteScene(sceneId: string): Promise<void> {
        await fetch(`${this.API_BASE}/${sceneId}`, {
            method: 'DELETE'
        });
    }
} 