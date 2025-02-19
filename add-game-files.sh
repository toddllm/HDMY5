#!/bin/bash

# Function to check if a command was successful
check_error() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

echo "Adding game builder files to project..."
echo "Current location: $(pwd)"
echo ""

# Create necessary directories
mkdir -p src/lib/{components,stores,types}
check_error "Failed to create directories"

# Create GameTypes.ts
cat > src/lib/types/GameTypes.ts << 'EOL'
export type Vector2D = {
    x: number;
    y: number;
};

export type Vector3D = {
    x: number;
    y: number;
    z: number;
};

export type GameObject = {
    id: string;
    position: Vector2D | Vector3D;
    type: '2d' | '3d';
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
EOL
check_error "Failed to create GameTypes.ts"

# Create gameStore.ts
cat > src/lib/stores/gameStore.ts << 'EOL'
import { writable } from 'svelte/store';
import type { GameScene } from '$lib/types/GameTypes';

export const activeScene = writable<GameScene | null>(null);
export const scenes = writable<GameScene[]>([]);

export const createScene = (name: string, type: '2d' | '3d') => {
    const newScene: GameScene = {
        id: crypto.randomUUID(),
        name,
        objects: [],
        type
    };
    
    scenes.update(currentScenes => [...currentScenes, newScene]);
    return newScene;
};
EOL
check_error "Failed to create gameStore.ts"

# Create GameCanvas.svelte
cat > src/lib/components/GameCanvas.svelte << 'EOL'
<script lang="ts">
    import { onMount } from 'svelte';
    import type { GameScene } from '$lib/types/GameTypes';
    
    export let scene: GameScene;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    
    onMount(() => {
        ctx = canvas.getContext('2d')!;
        
        // Set up the game loop
        const gameLoop = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Render game objects
            scene.objects.forEach(object => {
                // Basic rendering logic - will be expanded later
                if (object.type === '2d') {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(object.position.x, object.position.y, 50, 50);
                }
            });
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    });
</script>

<canvas
    bind:this={canvas}
    width={800}
    height={600}
    class="game-canvas"
>
</canvas>

<style>
    .game-canvas {
        border: 1px solid #ccc;
        background: #f0f0f0;
    }
</style>
EOL
check_error "Failed to create GameCanvas.svelte"

# Create +page.svelte
cat > src/routes/+page.svelte << 'EOL'
<script lang="ts">
    import GameCanvas from '$lib/components/GameCanvas.svelte';
    import { activeScene, createScene, scenes } from '$lib/stores/gameStore';
    import { onMount } from 'svelte';
    
    let currentMode: '2d' | '3d' = '2d';
    
    function handleNewScene() {
        console.log('Creating new scene...');
        const sceneName = `Scene ${$scenes.length + 1}`;
        const newScene = createScene(sceneName, currentMode);
        console.log('New scene created:', newScene);
        activeScene.set(newScene);
    }
    
    function handleAddObject() {
        console.log('Adding object to scene...');
        if (!$activeScene) return;
        
        const newObject = {
            id: crypto.randomUUID(),
            position: currentMode === '2d' 
                ? { x: 100, y: 100 } 
                : { x: 100, y: 100, z: 0 },
            type: currentMode,
            components: []
        };
        
        activeScene.update(scene => {
            if (!scene) return scene;
            return {
                ...scene,
                objects: [...scene.objects, newObject]
            };
        });
    }
    
    function handleModeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        currentMode = select.value as '2d' | '3d';
    }
    
    onMount(() => {
        // Create a default 2D scene
        if ($scenes.length === 0) {
            handleNewScene();
        }
    });
</script>

<div class="editor-layout">
    <header class="toolbar">
        <h1>HDMY5 Game Builder</h1>
        <div class="tools">
            <button on:click={handleNewScene}>New Scene</button>
            <button on:click={handleAddObject} disabled={!$activeScene}>Add Object</button>
            <select value={currentMode} on:change={handleModeChange}>
                <option value="2d">2D Mode</option>
                <option value="3d">3D Mode</option>
            </select>
        </div>
    </header>
    
    <main class="main-content">
        <aside class="sidebar">
            <div class="scene-hierarchy">
                <h2>Scene Hierarchy</h2>
                <div class="scenes-list">
                    {#each $scenes as scene}
                        <div 
                            class="scene-item"
                            class:active={$activeScene?.id === scene.id}
                            on:click={() => activeScene.set(scene)}
                        >
                            {scene.name} ({scene.type})
                            <div class="object-list">
                                {#each scene.objects as object}
                                    <div class="object-item">
                                        Object ({object.type})
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </aside>
        
        <div class="canvas-container">
            {#if $activeScene}
                <GameCanvas scene={$activeScene} />
            {/if}
        </div>
        
        <aside class="properties-panel">
            <h2>Properties</h2>
            {#if $activeScene}
                <div class="property">
                    <label>Scene Name:</label>
                    <input 
                        type="text" 
                        bind:value={$activeScene.name}
                        on:input={() => activeScene.update(s => s)}
                    />
                </div>
                <div class="property">
                    <label>Type:</label>
                    <span>{$activeScene.type}</span>
                </div>
                <div class="property">
                    <label>Objects:</label>
                    <span>{$activeScene.objects.length}</span>
                </div>
            {/if}
        </aside>
    </main>
</div>

<style>
    .editor-layout {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    
    .toolbar {
        padding: 1rem;
        background: #2c2c2c;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .main-content {
        flex: 1;
        display: grid;
        grid-template-columns: 250px 1fr 250px;
        gap: 1rem;
        padding: 1rem;
        background: #1e1e1e;
        color: white;
    }
    
    .sidebar, .properties-panel {
        background: #2c2c2c;
        padding: 1rem;
        border-radius: 4px;
    }
    
    .canvas-container {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #333;
        border-radius: 4px;
        padding: 1rem;
    }
    
    h1 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
    }
    
    .tools {
        display: flex;
        gap: 1rem;
    }
    
    button, select {
        padding: 0.5rem 1rem;
        background: #444;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }
    
    button:hover {
        background: #555;
    }
    
    .scenes-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .scene-item {
        padding: 0.5rem;
        background: #333;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .scene-item:hover {
        background: #444;
    }
    
    .scene-item.active {
        background: #555;
        border-left: 3px solid #fff;
    }
    
    .object-list {
        margin-left: 1rem;
        margin-top: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .object-item {
        padding: 0.25rem;
        background: #2c2c2c;
        border-radius: 2px;
        font-size: 0.9em;
    }
    
    .property {
        margin-bottom: 1rem;
    }
    
    .property label {
        display: block;
        margin-bottom: 0.25rem;
        color: #aaa;
    }
    
    .property input {
        width: 100%;
        padding: 0.5rem;
        background: #333;
        border: 1px solid #444;
        color: white;
        border-radius: 4px;
    }
    
    .property input:focus {
        outline: none;
        border-color: #666;
    }
</style>
EOL
check_error "Failed to create +page.svelte"

echo "Game builder files have been added!"
echo "You can now run 'npm run dev' to start the development server." 